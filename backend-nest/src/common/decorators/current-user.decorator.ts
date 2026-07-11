import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  institutionId?: string;
}

/**
 * Extracts the authenticated user from the request.
 * Requires JwtAuthGuard to be applied.
 *
 * @example
 * async getProfile(\@CurrentUser() user: AuthenticatedUser) {}
 * async getProfile(\@CurrentUser('id') userId: string) {}
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: AuthenticatedUser }>();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
