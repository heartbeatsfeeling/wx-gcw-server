import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor'
import { ExceptionInterceptor } from './common/interceptors/exception.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { VideosModule } from './videos/videos.module'
import { DatabaseModule } from './database/database.module'
import { LikesModule } from './likes/likes.module'
import { LogsModule } from './logs/logs.module'
import { UserLoginLogsModule } from './user-login-logs/user-login-logs.module'
import { AuthGuard } from './auth/auth.guard'
import { RedisModule } from './redis/redis.module'
import { MailModule } from './mail/mail.module'
import { CaptchaService } from './captcha/captcha.service'
import { CaptchaModule } from './captcha/captcha.module'
import { RolesModule } from './roles/roles.module'
import { PermissionController } from './permission/permission.controller'
import { PermissionModule } from './permission/permission.module'
import { PermissionService } from './permission/permission.service'
import { join } from 'path'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 静态文件的路径
      serveRoot: '/file' // 静态文件的访问路径前缀
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),
    AdminModule,
    UsersModule,
    AuthModule,
    VideosModule,
    DatabaseModule,
    RedisModule,
    LikesModule,
    LogsModule,
    UserLoginLogsModule,
    MailModule,
    CaptchaModule,
    RolesModule,
    PermissionModule
  ],
  controllers: [AppController, PermissionController],
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
    }, {
      provide: APP_GUARD,
      useClass: AuthGuard
    }, CaptchaService, PermissionService
  ]
})
export class AppModule {}
