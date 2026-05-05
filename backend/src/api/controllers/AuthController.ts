import { Request, Response } from 'express';
import { AuthService } from '../../domain/services/AuthService';
import logger from '../../core/config/logger';

export class AuthController {
  private authService = new AuthService();

  signup = async (req: Request, res: Response) => {
    logger.info(`[AUTH] Signup attempt: ${req.body.email}`);
    const user = await this.authService.signup(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your OTP.',
      data: { user: { id: user.id, email: user.email, fullName: user.fullName } },
    });
  };

  login = async (req: Request, res: Response) => {
    logger.info(`[AUTH] Login attempt: ${req.body.email}`);
    const { user, accessToken, refreshToken } = await this.authService.login(
      req.body.email,
      req.body.password
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  };

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { accessToken } = await this.authService.refresh(token);
    res.json({ status: 'success', data: { accessToken } });
  };

  logout = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie('refreshToken');
    res.json({ status: 'success', message: 'Logged out successfully' });
  };
}
