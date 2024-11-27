import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { AdminUser } from 'types/db'
import { randomUUID } from 'node:crypto'
import * as svgCaptcha from 'svg-captcha'
import { RedisService } from 'src/redis/redis.service'
import { RegisterDto } from 'src/common/dto/admin.dto'
import { JwtService } from '@nestjs/jwt'
@Injectable()
export class AdminService {
  constructor (
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 验证用户名是否可用
   */
  async checkAvailability (userName: string) {
    const sql = `
      SELECT
        *
      FROM
        admin_users
      WHERE
        admin_users.name = ?
    `
    return (await this.databaseService.query<AdminUser[]>(sql, [userName])).length === 0
  }

  /**
   * 生成验证码
   */
  async generateCaptcha () {
    const captchaId = randomUUID()
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      width: 90,
      color: true
    })
    await this.redisService.set(`captcha:${captchaId}`, captcha.text, 300) // 存储验证码，有效期 300 秒
    return {
      svg: captcha.data,
      id: captchaId
    }
  }

  async findAdminUser (email: string, password: string): Promise<null | AdminUser> {
    const sql = `
        SELECT
          id,
          email,
          UNIX_TIMESTAMP(create_time) * 1000 as createTime,
          UNIX_TIMESTAMP(updated_time) * 1000 as updatedTime
        FROM
          admin_users
        WHERE
          email = ? AND password = ?
      `
    const user = await this.databaseService.query<AdminUser[]>(sql, [email, password])
    return user?.[0]
  }

  async adminLogin (email: string, password: string) {
    const user = await this.findAdminUser(email, password)
    if (!user) {
      return {
        status: false,
        message: '用户不存在或密码错误'
      }
    }
    console.log('user', user)
    const payload = { email: user.email, userId: user.id, createTime: user.createTime, updatedTime: user.updatedTime }
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  /**
   * 校验验证码是否有效
   */
  async validCaptcha (captchaId: string, captchaText: string) {
    const res = await this.redisService.get(`captcha:${captchaId}`)
    return res?.toLowerCase() === captchaText?.toLowerCase()
  }

  register (params: RegisterDto) {
    console.log(params)
  }
}
