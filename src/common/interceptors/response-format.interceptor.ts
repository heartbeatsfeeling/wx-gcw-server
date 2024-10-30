import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
  } from '@nestjs/common'
  import { Observable } from 'rxjs'
  import { map } from 'rxjs/operators'
  
  @Injectable()
  export class ResponseFormatInterceptor implements NestInterceptor {
    intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
      const response = context.switchToHttp().getResponse()
      return next.handle().pipe(
        map((data) => {
          return {
            status: true,
            statusCode: response.statusCode, // 动态获取状态码
            message: 'success',
            data
          }
        })
      )
    }
  }
  