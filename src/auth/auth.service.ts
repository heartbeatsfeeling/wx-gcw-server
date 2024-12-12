import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { jwtConfig } from 'src/common/config'
import { AdminUserPayLoad, wxUserPayLoad } from 'types/payload'

@Injectable()
export class AuthService {
  constructor (
    private readonly httpService: HttpService,
    private jwtService: JwtService
  ) {}

  async jwtVerify<T = any> (token: string): Promise<T | null> {
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          { secret: jwtConfig.secret }
        )
        return payload
      } catch {
        return null
      }
    } else {
      return null
    }
  }

  async openid2Token (openid: string) {
    return await this.jwtService.signAsync({
      openid
    })
  }

  async getAdminJWTPayload (token: string): Promise<null | Omit<AdminUserPayLoad, 'iat' | 'exp' | 'roles'>> {
    const payload = await this.jwtVerify<AdminUserPayLoad>(token)
    if (payload) {
      return {
        userId: payload.userId
      }
    } else {
      return null
    }
  }

  async token2openid (token: string): Promise<string | null> {
    const payload = await this.jwtVerify<wxUserPayLoad>(token)
    if (payload) {
      return payload.openid
    } else {
      return null
    }
  }

  async wxLogin (code: string): Promise<{
    status: boolean
    openid: string | null
  }> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session'
    const params = {
      appid: process.env.APPID,
      secret: process.env.SECRET,
      js_code: code,
      grant_type: 'authorization_code'
    }
    const response = await firstValueFrom(
      this.httpService.get(url, { params })
    )
    if (response.status === 200) {
      return {
        status: true,
        openid: response.data.openid
      }
    } else {
      return {
        status: false,
        openid: null
      }
    }
  }

  /**
   * 加密密码
   * @param plainPassword 用户的明文密码
   * @returns 加密后的密码
   */
  async hashPassword (plainPassword: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    return hashedPassword
  }

  /**
   * 验证密码
   * @param plainPassword 用户输入的明文密码
   * @param hashedPassword 数据库中存储的加密密码
   * @returns 验证结果，true 表示匹配
   */
  async validatePassword (plainPassword: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
    return isMatch
  }
}
