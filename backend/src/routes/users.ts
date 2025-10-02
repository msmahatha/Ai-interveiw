import { Router, Response } from 'express';
import User from '../models/User';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all users (interviewers only)
router.get('/', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query: any = { isActive: true };
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-__v')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// Get user by ID
router.get('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      throw createError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  })
);

// Update user (interviewers only)
router.put('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, role, isActive, preferences } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    // Update fields if provided
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  })
);

// Delete user (soft delete - set inactive)
router.delete('/:id', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  })
);

// Get user statistics
router.get('/stats/overview', 
  authenticate, 
  authorize(['interviewer']), 
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Promise.all([
      User.countDocuments({ role: 'interviewer', isActive: true }),
      User.countDocuments({ role: 'candidate', isActive: true }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    const [interviewers, candidates, activeUsers, inactiveUsers] = stats;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          interviewers,
          candidates,
          activeUsers,
          inactiveUsers,
          totalUsers: activeUsers + inactiveUsers,
        },
      },
    });
  })
);

export default router;