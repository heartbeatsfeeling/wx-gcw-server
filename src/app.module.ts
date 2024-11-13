import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor'
import { ExceptionInterceptor } from './common/interceptors/exception.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { VideosModule } from './videos/videos.module'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),
    AdminModule,
    UsersModule,
    AuthModule,
    VideosModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor
    }, {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor
    }, {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
