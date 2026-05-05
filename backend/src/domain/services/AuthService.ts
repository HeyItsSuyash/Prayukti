import argon2 from 'argon2';
import { Role } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../../utils/jwt';
import { 
  UnauthorizedError, 
  ConflictError, 
  BadRequestError 
} from '../../core/errors/AppError';
import prisma from '../../core/config/prisma';

export class AuthService {
  private userRepository = new UserRepository();

  async signup(data: any) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User already registered');
    }

    const passwordHash = await argon2.hash(data.password);
    
    return this.userRepository.create({
      ...data,
      passwordHash,
      password: undefined, // Remove raw password
    });
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenError('Please verify your account first');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { user, accessToken, refreshToken };
  }

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const newPayload = { id: payload.id, email: payload.email, role: payload.role };
    const accessToken = generateAccessToken(newPayload);

    return { accessToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.delete({
      where: { token },
    }).catch(() => {}); // Ignore if not found
  }
}

import { ForbiddenError } from '../../core/errors/AppError';
