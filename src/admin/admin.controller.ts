import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/common/decorators/public.decorator'
import { AdminLoginDto, RegisterDto } from 'src/common/dto/admin.dto'
import { CustomRequest } from 'types/request'
import { Response } from 'express'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor (
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login (
    @Body() { email, password, captchaId, captchaText }: AdminLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const captcha = await this.adminService.validCaptcha(captchaId, captchaText)
    if (captcha) {
      const user = await this.adminService.adminLogin(email, password)
      if (user.status) {
        response.cookie('token', user.access_token, {
          maxAge: 24 * 60 * 60 * 1000
        })
        return true
      } else {
        throw new HttpException(user.message, HttpStatus.OK)
      }
    } else {
      throw new HttpException('验证码过期或错误', HttpStatus.OK)
    }
  }

  @Get('logout')
  @HttpCode(200)
  async logout (
    @Res({ passthrough: true }) response: Response
  ) {
    response.clearCookie('token')
    return true
  }

  @Public()
  @Get('userInfo')
  async getAdminUserInfo (@Req() request: CustomRequest) {
    const message = '获取用户信息失败'
    try {
      const payload = await this.authService.getAdminJWTPayload(request.cookies.token)
      if (payload) {
        return payload
      } else {
        throw new HttpException(message, HttpStatus.OK)
      }
    } catch {

    }
    throw new HttpException(message, HttpStatus.OK)
  }

  /**
   * 验证email是否可用接口 /admin/check-availability
   */
  @Public()
  @Get('check-availability')
  checkAvailability (
    @Query('email') userName?: string
  ) {
    if (userName) {
      return this.adminService.checkAvailability(userName)
    }
    return false
  }

  /**
   * 用户注册接口 admin/register
   */
  @Public()
  @Post('register')
  @HttpCode(200)
  async register (
    @Body() body: RegisterDto
  ) {
    return this.adminService.register(body)
  }

  /**
   * 获取验证码接口 admin/captcha
   */
  @Public()
  @Get('captcha')
  captcha () {
    return this.adminService.generateCaptcha()
  }

  /**
   * 找回用户密码接口 admin/reest-password
   */
  @Public()
  @Post('reest-password')
  @HttpCode(200)
  resetPassword (
    @Body() body: RegisterDto
  ) {
    console.log(body)
  }
}
