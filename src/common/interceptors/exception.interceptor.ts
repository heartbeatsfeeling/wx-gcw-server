import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExceptionInterceptor.name)

  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let message: any = 'Internal server error'

        // 判断是否为 HttpException
        if (error instanceof HttpException) {
          status = error.getStatus()
          message = error.getResponse()
        } else {
          message = error.message || 'An unexpected error occurred'
        }
        this.logger.error(`Status: ${status}, Error Message: ${error.message}`, error.stack)
        // 返回自定义的错误响应结构
        throw new HttpException({
          status: false,
          statusCode: status,
          message
        }, status)
      })
    )
  }
}
