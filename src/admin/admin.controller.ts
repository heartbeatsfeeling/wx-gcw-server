import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/common/decorators/public.decorator'
import { AdminLoginDto, RegisterDto, RestPasswrodDto } from 'src/common/dto/admin.dto'
import { CustomRequest } from 'types/request'
import { Response } from 'express'
import { AdminService } from './admin.service'
import { CaptchaService } from 'src/captcha/captcha.service'
import { MailService } from 'src/mail/mail.service'
import { randomUUID } from 'node:crypto'

@Controller('admin')
export class AdminController {
  constructor (
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly captchaService: CaptchaService,
    private readonly mailService: MailService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login (
    @Body() { email, password, captchaId, captchaText }: AdminLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const captcha = await this.captchaService.validateCaptcha(captchaId, captchaText)
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
    if (!this.checkAvailability(body.email)) {
      throw new HttpException('邮箱地址已经存在', HttpStatus.BAD_GATEWAY)
    }
    if (this.captchaService.validateCaptcha(body.email, body.captchaText)) {
      return this.adminService.insertUser(body)
    } else {
      throw new HttpException('验证码错误', HttpStatus.BAD_GATEWAY)
    }
  }

  /**
   * 获取验证码接口 admin/captcha
   */
  @Public()
  @Get('captcha')
  captcha () {
    return this.captchaService.generateCaptcha(randomUUID())
  }

  /**
   * 发送验证码到邮件接口 /api/admin/send-captcha2email
   */
  @Public()
  @Get('send-captcha2email')
  async sendCaptcha2Email (
    @Query('email') email: string
  ) {
    if (email.includes('@')) {
      const res = await this.captchaService.generateCaptcha(email)
      // this.mailService.sendMail(
      //   email,
      //   '验证码，有效期为5分钟',
      //   `找回密码验证码为：${res.text}`
      // )
      console.log(res.text)
      return true
    }
    throw new HttpException('发送邮件出错', HttpStatus.BAD_GATEWAY)
  }

  /**
   * 找回用户密码接口 admin/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  resetPassword (
    @Body() body: RestPasswrodDto
  ) {
    return this.adminService.updateUser(body)
  }

  /**
   * 用户列表
   */
  @Get()
  findAllUser () {}
}
