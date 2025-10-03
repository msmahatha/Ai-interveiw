import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { verifyFirebaseToken, createCustomToken } from '../config/firebase';

const router = Router();

// Register/Login user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 Registration attempt started with body:', { 
    hasFirebaseToken: !!req.body.firebaseToken, 
    name: req.body.name, 
    role: req.body.role 
  });
  
  const { firebaseToken, name, role = 'candidate' } = req.body;

  if (!firebaseToken) {
    console.error('❌ Firebase token is required');
    throw createError('Firebase token is required', 400);
  }

  if (!name) {
    console.error('❌ Name is required');
    throw createError('Name is required', 400);
  }

  let decodedToken;
  try {
    console.log('🔥 Verifying Firebase token...');
    decodedToken = await verifyFirebaseToken(firebaseToken);
    const { uid, email } = decodedToken;
    console.log('✅ Firebase token verified for user:', { uid, email });
  } catch (error) {
    console.error('❌ Firebase token verification failed:', error);
    throw createError('Invalid Firebase token', 401);
  }

  const { uid, email } = decodedToken;

  if (!email) {
    console.error('❌ Email not found in Firebase token');
    throw createError('Email not found in Firebase token', 400);
  }

  let user;
  try {
    console.log('🔍 Checking if user exists in database for uid:', uid);
    user = await User.findOne({ uid });
    console.log('📊 User lookup result:', user ? `User found: ${user.email}` : 'New user - will create');
  } catch (dbError) {
    console.error('❌ Database query failed:', dbError);
    throw createError('Database connection error', 500);
  }

  try {
    if (user) {
      // Update existing user if needed
      console.log('📝 Updating existing user:', user.email);
      user.name = name;
      user.role = role;
      user.isActive = true;
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      // Create new user
      console.log('🆕 Creating new user with email:', email);
      user = new User({
        uid,
        email,
        name,
        role,
        isActive: true,
      });
      await user.save();
      console.log('✅ New user created successfully');
    }

    res.status(200).json({
      success: true,
      message: user.isNew ? 'User created successfully' : 'User updated successfully',
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
  } catch (saveError) {
    console.error('❌ Failed to save user to database:', saveError);
    throw createError('Failed to save user', 500);
  }
}));

// Test Firebase token verification (for debugging)
router.post('/test-token', asyncHandler(async (req: Request, res: Response) => {
  console.log('🧪 Testing Firebase token verification');
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    throw createError('Firebase token is required for testing', 400);
  }

  try {
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    res.status(200).json({
      success: true,
      message: 'Firebase token is valid',
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        aud: decodedToken.aud,
        iss: decodedToken.iss,
      },
    });
  } catch (error) {
    console.error('❌ Firebase token test failed:', error);
    throw createError('Invalid Firebase token', 401);
  }
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