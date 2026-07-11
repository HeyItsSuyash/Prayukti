import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type UserRole = 'admin' | 'instructor' | 'student' | 'institution_admin';

/**
 * Restrict a route to specific roles.
 *
 * @example
 * \@Roles('admin', 'institution_admin')
 * \@Get('users')
 * findAll() {}
 */
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
