import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { verifyFirebaseToken, createCustomToken } from '../config/firebase';

const router = Router();

// Register/Login user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { firebaseToken, name, role = 'candidate' } = req.body;

  if (!firebaseToken || !name) {
    throw createError('Firebase token and name are required', 400);
  }

  // Verify Firebase token
  const decodedToken = await verifyFirebaseToken(firebaseToken);
  const { uid, email } = decodedToken;

  if (!email) {
    throw createError('Email not found in Firebase token', 400);
  }

  // Check if user already exists
  let user = await User.findOne({ uid });

  if (user) {
    // Update existing user if needed
    user.name = name;
    user.role = role;
    user.isActive = true;
    await user.save();
  } else {
    // Create new user
    user = new User({
      uid,
      email,
      name,
      role,
      isActive: true,
    });
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: user ? 'User updated successfully' : 'User created successfully',
    data: {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
}));

// Get current user profile
router.get('/profile', authenticate, asyncHandler(async (req: any, res: Response) => {
  const user = await User.findOne({ uid: req.user.uid });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
}));

// Update user profile
router.put('/profile', authenticate, asyncHandler(async (req: any, res: Response) => {
  const { name, profilePicture, preferences } = req.body;

  const user = await User.findOne({ uid: req.user.uid });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Update fields if provided
  if (name) user.name = name;
  if (profilePicture) user.profilePicture = profilePicture;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        updatedAt: user.updatedAt,
      },
    },
  });
}));

// Verify token endpoint
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    throw createError('Firebase token is required', 400);
  }

  // Verify Firebase token
  const decodedToken = await verifyFirebaseToken(firebaseToken);

  // Find user in our database
  const user = await User.findOne({ uid: decodedToken.uid });

  if (!user || !user.isActive) {
    throw createError('User not found or inactive', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Token verified successfully',
    data: {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
}));

// Logout endpoint (mainly for cleanup)
router.post('/logout', authenticate, asyncHandler(async (req: any, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // But you might want to do cleanup here
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export default router;