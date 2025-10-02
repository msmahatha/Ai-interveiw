import { Router, Response } from 'express';
import Candidate from '../models/Candidate';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all candidates
router.get('/', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      position, 
      minScore, 
      maxScore,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = {};
    
    // Filter by interviewer if candidate role
    if (req.user?.role === 'candidate') {
      query.email = req.user.email;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (position) {
      query.position = { $regex: position, $options: 'i' };
    }
    
    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = Number(minScore);
      if (maxScore) query.score.$lte = Number(maxScore);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .populate('interviewerId', 'name email')
        .select('-__v')
        .skip(skip)
        .limit(Number(limit))
        .sort(sort),
      Candidate.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        candidates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  })
);

// Get candidate by ID
router.get('/:id', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let candidate = Candidate.findById(req.params.id)
      .populate('interviewerId', 'name email');

    // If candidate role, ensure they can only access their own data
    if (req.user?.role === 'candidate') {
      candidate = candidate.where({ email: req.user.email });
    }

    const result = await candidate;

    if (!result) {
      throw createError('Candidate not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { candidate: result },
    });
  })
);

// Create new candidate
router.post('/', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const candidateData = {
      ...req.body,
      interviewerId: req.user?.role === 'interviewer' ? req.body.interviewerId : undefined,
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: { candidate },
    });
  })
);

// Update candidate
router.put('/:id', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let candidate = Candidate.findById(req.params.id);

    // If candidate role, ensure they can only update their own data
    if (req.user?.role === 'candidate') {
      candidate = candidate.where({ email: req.user.email });
    }

    const result = await candidate;

    if (!result) {
      throw createError('Candidate not found', 404);
    }

    // Update allowed fields based on user role
    const allowedFields = req.user?.role === 'interviewer' 
      ? ['name', 'email', 'phone', 'position', 'experience', 'score', 'status', 'summary', 'notes', 'skills']
      : ['name', 'phone', 'skills']; // Candidates can only update limited fields

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        (result as any)[key] = req.body[key];
      }
    });

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: { candidate: result },
    });
  })
);

// Delete candidate
router.delete('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      throw createError('Candidate not found', 404);
    }

    await candidate.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  })
);

// Add answer to candidate
router.post('/:id/answers', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { question, answer, score, timeTaken, timeAllowed, difficulty, feedback } = req.body;

    let candidate = Candidate.findById(req.params.id);

    // If candidate role, ensure they can only update their own data
    if (req.user?.role === 'candidate') {
      candidate = candidate.where({ email: req.user.email });
    }

    const result = await candidate;

    if (!result) {
      throw createError('Candidate not found', 404);
    }

    result.answers.push({
      question,
      answer,
      score: score || 0,
      timeTaken: timeTaken || 0,
      timeAllowed: timeAllowed || 300,
      difficulty: difficulty || 'medium',
      feedback,
    });

    // Update overall score (average of all answers)
    const totalScore = result.answers.reduce((sum, ans) => sum + ans.score, 0);
    result.score = Math.round(totalScore / result.answers.length);

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Answer added successfully',
      data: { candidate: result },
    });
  })
);

// Get candidate statistics
router.get('/stats/overview', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Promise.all([
      Candidate.countDocuments({ status: 'pending' }),
      Candidate.countDocuments({ status: 'in-progress' }),
      Candidate.countDocuments({ status: 'completed' }),
      Candidate.countDocuments({ status: 'rejected' }),
      Candidate.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ]),
    ]);

    const [pending, inProgress, completed, rejected, avgScoreResult] = stats;
    const averageScore = avgScoreResult[0]?.averageScore || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          pending,
          inProgress,
          completed,
          rejected,
          total: pending + inProgress + completed + rejected,
          averageScore: Math.round(averageScore),
        },
      },
    });
  })
);

export default router;