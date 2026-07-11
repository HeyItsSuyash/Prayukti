import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  errors?: unknown[];
  path: string;
  timestamp: string;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const requestId = (request.headers['x-request-id'] as string) ?? '';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let errors: unknown[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) || exception.message;
        error = (resp['error'] as string) || exception.name;

        // Handle class-validator validation errors (array of messages)
        if (Array.isArray(resp['message'])) {
          errors = resp['message'] as unknown[];
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown exception type: ${JSON.stringify(exception)}`);
    }

    const body: ApiError = {
      success: false,
      statusCode,
      message,
      error,
      ...(errors && { errors }),
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    };

    this.logger.warn(
      `HTTP ${statusCode} on [${request.method}] ${request.url} — ${message}`,
    );

    void response.status(statusCode).send(body);
  }
}
