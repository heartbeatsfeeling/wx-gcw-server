import { Controller, Post, HttpCode, HttpStatus, Body, Headers, HttpException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from 'src/users/users.service'
import { UserLoginLogsService } from 'src/user-login-logs/user-login-logs.service'

@Controller('auth')
export class AuthController {
  constructor (
    private authService: AuthService,
    private usersService: UsersService,
    private userLoginLogsService: UserLoginLogsService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('wx-login')
  async wxLogin (
    @Headers('token') token: string,
    @Body('code') code: string
  ) {
    const openid = await this.authService.token2openid(token)
    if (openid) { // 登录过
      return await this.authService.openid2Token(openid)
    } else {
      const res = await this.authService.wxLogin(code)
      this.usersService.createUser(res.openid)
      this.userLoginLogsService.insert(res.openid)
      if (res.status) {
        return await this.authService.openid2Token(res.openid)
      } else {
        throw new HttpException('Auth error', HttpStatus.NOT_IMPLEMENTED)
      }
    }
  }
}
