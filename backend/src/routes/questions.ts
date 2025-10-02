import { Router, Response } from 'express';
import Question from '../models/Question';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all questions
router.get('/', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      page = 1, 
      limit = 10, 
      difficulty, 
      category, 
      tags,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = { isActive };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('createdBy', 'name email')
        .select('-__v')
        .skip(skip)
        .limit(Number(limit))
        .sort(sort),
      Question.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        questions,
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

// Get random questions for interview
router.get('/random', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      count = 6,
      difficulty = 'medium',
      category,
      excludeIds = []
    } = req.query;

    const query: any = { 
      isActive: true,
      difficulty,
    };

    if (category) {
      query.category = category;
    }

    const excludeArray = Array.isArray(excludeIds) ? excludeIds : 
                        excludeIds ? [excludeIds] : [];
    
    if (excludeArray.length > 0) {
      query._id = { $nin: excludeArray };
    }

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: Number(count) } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, email: 1 } }]
        }
      },
      { $unwind: '$createdBy' }
    ]);

    res.status(200).json({
      success: true,
      data: { questions },
    });
  })
);

// Get question by ID
router.get('/:id', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!question) {
      throw createError('Question not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { question },
    });
  })
);

// Create new question (interviewers only)
router.post('/', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const questionData = {
      ...req.body,
      createdBy: req.user?.uid, // This should be the MongoDB ObjectId, not Firebase UID
    };

    // Find the user's MongoDB ObjectId from their Firebase UID
    const User = require('../models/User').default;
    const user = await User.findOne({ uid: req.user?.uid });
    
    if (!user) {
      throw createError('User not found', 404);
    }

    questionData.createdBy = user._id;

    const question = new Question(questionData);
    await question.save();

    await question.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question },
    });
  })
);

// Update question (interviewers only, own questions or admin)
router.put('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const User = require('../models/User').default;
    const user = await User.findOne({ uid: req.user?.uid });
    
    if (!user) {
      throw createError('User not found', 404);
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      throw createError('Question not found', 404);
    }

    // Check if user owns this question (you might want to add admin role check)
    if (question.createdBy.toString() !== user._id.toString()) {
      throw createError('You can only update your own questions', 403);
    }

    const allowedFields = [
      'text', 'difficulty', 'category', 'timeLimit', 'expectedAnswer', 
      'tags', 'isActive'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        (question as any)[key] = req.body[key];
      }
    });

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: { question },
    });
  })
);

// Delete question (interviewers only, own questions or admin)
router.delete('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const User = require('../models/User').default;
    const user = await User.findOne({ uid: req.user?.uid });
    
    if (!user) {
      throw createError('User not found', 404);
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      throw createError('Question not found', 404);
    }

    // Check if user owns this question
    if (question.createdBy.toString() !== user._id.toString()) {
      throw createError('You can only delete your own questions', 403);
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  })
);

// Update question usage statistics
router.post('/:id/usage', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { score, success } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question) {
      throw createError('Question not found', 404);
    }

    // Update usage statistics
    question.usage.timesUsed += 1;
    
    if (typeof score === 'number') {
      const currentTotal = question.usage.averageScore * (question.usage.timesUsed - 1);
      question.usage.averageScore = (currentTotal + score) / question.usage.timesUsed;
    }
    
    if (typeof success === 'boolean') {
      const currentSuccesses = Math.round((question.usage.successRate / 100) * (question.usage.timesUsed - 1));
      const newSuccesses = currentSuccesses + (success ? 1 : 0);
      question.usage.successRate = (newSuccesses / question.usage.timesUsed) * 100;
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question usage updated successfully',
      data: { question },
    });
  })
);

// Get question categories
router.get('/meta/categories', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const categories = await Question.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  })
);

// Get question tags
router.get('/meta/tags', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const tags = await Question.distinct('tags', { isActive: true });

    res.status(200).json({
      success: true,
      data: { tags },
    });
  })
);

// Get question statistics
router.get('/stats/overview', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Promise.all([
      Question.countDocuments({ difficulty: 'easy', isActive: true }),
      Question.countDocuments({ difficulty: 'medium', isActive: true }),
      Question.countDocuments({ difficulty: 'hard', isActive: true }),
      Question.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: false }),
    ]);

    const [easy, medium, hard, active, inactive] = stats;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          byDifficulty: { easy, medium, hard },
          active,
          inactive,
          total: active + inactive,
        },
      },
    });
  })
);

export default router;