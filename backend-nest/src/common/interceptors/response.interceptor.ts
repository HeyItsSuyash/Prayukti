import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { FastifyRequest } from 'fastify';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest & { requestId?: string }>();
    const response = ctx.getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((data) => {
        // Allow controllers to pass pre-shaped responses through
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in (data as object)
        ) {
          return data as unknown as ApiResponse<T>;
        }

        return {
          success: true as const,
          statusCode: response.statusCode,
          message: 'Request successful',
          data,
          timestamp: new Date().toISOString(),
          ...(request.requestId && { requestId: request.requestId }),
        };
      }),
    );
  }
}
