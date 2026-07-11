import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    // Assign a request ID if not already set
    const requestId =
      (request.headers['x-request-id'] as string) ?? uuidv4();
    void response.header('X-Request-Id', requestId);

    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] ?? '';
    const startTime = Date.now();

    // Attach requestId to request for downstream use
    (request as FastifyRequest & { requestId: string }).requestId = requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${statusCode} ${duration}ms — ${ip} — "${userAgent}"`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode =
            (err as { status?: number })?.status ??
            (err as { statusCode?: number })?.statusCode ??
            500;
          this.logger.warn(
            `[${requestId}] ${method} ${url} ${statusCode} ${duration}ms — ${ip} — ERROR`,
          );
        },
      }),
    );
  }
}
