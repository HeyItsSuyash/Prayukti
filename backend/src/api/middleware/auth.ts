import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../../core/errors/AppError';
import { verifyAccessToken } from '../../utils/jwt';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded; // Need to extend Express Request type
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Token verification failed'));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      throw new ForbiddenError(
        `User role '${req.user?.role}' is not authorized to access this route`
      );
    }
    next();
  };
};
