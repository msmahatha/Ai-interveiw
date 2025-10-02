import { Router, Response } from 'express';
import Interview from '../models/Interview';
import Candidate from '../models/Candidate';
import Question from '../models/Question';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all interviews
router.get('/', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      interviewerId,
      candidateId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = {};
    
    // Filter by interviewer if candidate role
    if (req.user?.role === 'candidate') {
      // Find candidate by email to get candidateId
      const candidate = await Candidate.findOne({ email: req.user.email });
      if (candidate) {
        query.candidateId = (candidate as any)._id;
      } else {
        // If no candidate found, return empty results
        res.status(200).json({
          success: true,
          data: {
            interviews: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              pages: 0,
            },
          },
        });
        return;
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    if (interviewerId) {
      query.interviewerId = interviewerId;
    }
    
    if (candidateId) {
      query.candidateId = candidateId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate('candidateId', 'name email position')
        .populate('interviewerId', 'name email')
        .populate('questions', 'text difficulty category')
        .select('-__v')
        .skip(skip)
        .limit(Number(limit))
        .sort(sort),
      Interview.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        interviews,
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

// Get interview by ID
router.get('/:id', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let interview = Interview.findById(req.params.id)
      .populate('candidateId', 'name email position experience')
      .populate('interviewerId', 'name email')
      .populate('questions', 'text difficulty category timeLimit');

    const result = await interview;

    if (!result) {
      throw createError('Interview not found', 404);
    }

    // Check access permissions
    if (req.user?.role === 'candidate') {
      const candidate = await Candidate.findOne({ email: req.user.email });
      if (!candidate || (result.candidateId as any).toString() !== ((candidate._id as any)).toString()) {
        throw createError('Access denied', 403);
      }
    }

    res.status(200).json({
      success: true,
      data: { interview: result },
    });
  })
);

// Create new interview (interviewers only)
router.post('/', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      candidateId, 
      questionIds = [], 
      template = 'Standard Interview',
      settings = {}
    } = req.body;

    // Find the interviewer's MongoDB ObjectId
    const User = require('../models/User').default;
    const user = await User.findOne({ uid: req.user?.uid });
    
    if (!user) {
      throw createError('User not found', 404);
    }

    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw createError('Candidate not found', 404);
    }

    // If no questions provided, get random questions
    let questions = questionIds;
    if (!questions || questions.length === 0) {
      const randomQuestions = await Question.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 6 } }
      ]);
      questions = randomQuestions.map(q => q._id);
    }

    const interviewData = {
      candidateId,
      interviewerId: user._id,
      questions,
      template,
      settings: {
        timePerQuestion: 300,
        allowSkip: true,
        showScore: false,
        recordSession: false,
        ...settings
      },
      status: 'scheduled'
    };

    const interview = new Interview(interviewData);
    await interview.save();

    await interview.populate([
      { path: 'candidateId', select: 'name email position' },
      { path: 'interviewerId', select: 'name email' },
      { path: 'questions', select: 'text difficulty category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      data: { interview },
    });
  })
);

// Start interview
router.patch('/:id/start', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      throw createError('Interview not found', 404);
    }

    // Check permissions
    if (req.user?.role === 'candidate') {
      const candidate = await Candidate.findOne({ email: req.user.email });
      if (!candidate || (interview.candidateId as any).toString() !== ((candidate._id as any)).toString()) {
        throw createError('Access denied', 403);
      }
    }

    if (interview.status !== 'scheduled') {
      throw createError('Interview cannot be started', 400);
    }

    interview.status = 'in-progress';
    interview.startTime = new Date();
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview started successfully',
      data: { interview },
    });
  })
);

// Complete interview
router.patch('/:id/complete', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { totalScore, feedback, recommendations = [] } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      throw createError('Interview not found', 404);
    }

    // Check permissions
    if (req.user?.role === 'candidate') {
      const candidate = await Candidate.findOne({ email: req.user.email });
      if (!candidate || (interview.candidateId as any).toString() !== ((candidate._id as any)).toString()) {
        throw createError('Access denied', 403);
      }
    }

    if (interview.status !== 'in-progress') {
      throw createError('Interview is not in progress', 400);
    }

    interview.status = 'completed';
    interview.endTime = new Date();
    
    if (interview.startTime && interview.endTime) {
      interview.duration = Math.round(
        (interview.endTime.getTime() - interview.startTime.getTime()) / (1000 * 60)
      );
    }

    interview.result = {
      totalScore: totalScore || 0,
      passed: (totalScore || 0) >= 60, // Passing score of 60%
      feedback: feedback || '',
      recommendations: recommendations || []
    };

    await interview.save();

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      status: 'completed',
      score: totalScore || 0
    });

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      data: { interview },
    });
  })
);

// Cancel interview (interviewers only)
router.patch('/:id/cancel', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      throw createError('Interview not found', 404);
    }

    if (interview.status === 'completed') {
      throw createError('Cannot cancel completed interview', 400);
    }

    interview.status = 'cancelled';
    await interview.save();

    // Update candidate status back to pending
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully',
      data: { interview },
    });
  })
);

// Update interview settings (interviewers only)
router.patch('/:id/settings', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      throw createError('Interview not found', 404);
    }

    if (interview.status !== 'scheduled') {
      throw createError('Cannot update settings for started interview', 400);
    }

    const allowedSettings = ['timePerQuestion', 'allowSkip', 'showScore', 'recordSession'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedSettings.includes(key)) {
        (interview.settings as any)[key] = req.body[key];
      }
    });

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview settings updated successfully',
      data: { interview },
    });
  })
);

// Get interview statistics
router.get('/stats/overview', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Promise.all([
      Interview.countDocuments({ status: 'scheduled' }),
      Interview.countDocuments({ status: 'in-progress' }),
      Interview.countDocuments({ status: 'completed' }),
      Interview.countDocuments({ status: 'cancelled' }),
      Interview.aggregate([
        { $match: { status: 'completed' } },
        { $group: { 
          _id: null, 
          averageScore: { $avg: '$result.totalScore' },
          averageDuration: { $avg: '$duration' }
        }}
      ]),
    ]);

    const [scheduled, inProgress, completed, cancelled, avgResult] = stats;
    const averageScore = avgResult[0]?.averageScore || 0;
    const averageDuration = avgResult[0]?.averageDuration || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          scheduled,
          inProgress,
          completed,
          cancelled,
          total: scheduled + inProgress + completed + cancelled,
          averageScore: Math.round(averageScore),
          averageDuration: Math.round(averageDuration),
        },
      },
    });
  })
);

export default router;