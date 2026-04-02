import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (result) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.debug(
            `${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | IP: ${ip}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            `${method} ${url} | Status: ${error.status || 500} | Duration: ${duration}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
