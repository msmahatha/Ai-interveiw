import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    role: 'interviewer' | 'candidate';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Authentication attempt for:', req.method, req.path);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or invalid format:', authHeader ? 'Invalid format' : 'Missing header');
      res.status(401).json({
        success: false,
        message: 'No token provided or invalid format',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Token received, verifying with Firebase...');

    try {
      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(token);
      console.log('✅ Firebase token verified for user:', decodedToken.uid);
    } catch (firebaseError) {
      console.error('❌ Firebase token verification failed:', firebaseError);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase token',
      });
      return;
    }

    const decodedToken = await verifyFirebaseToken(token);

    try {
      console.log('🔍 Looking up user in database:', decodedToken.uid);
      // Find user in our database
      const user = await User.findOne({ uid: decodedToken.uid });
      console.log('📊 Database user lookup:', user ? 'User found' : 'User not found');

      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive in database');
        res.status(401).json({
          success: false,
          message: 'User not found or inactive',
        });
        return;
      }
    } catch (dbError) {
      console.error('❌ Database lookup failed in auth middleware:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database error during authentication',
      });
      return;
    }

    const user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive in final check');
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    // Attach user information to request
    req.user = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log('✅ Authentication successful for user:', user.uid);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};