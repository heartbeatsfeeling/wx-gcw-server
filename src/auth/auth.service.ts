import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
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

  async getAdminJWTPayload (token: string): Promise<Omit<AdminUserPayLoad, 'iat' | 'exp'>> {
    const payload = await this.jwtVerify<AdminUserPayLoad>(token)
    if (payload) {
      return {
        createTime: payload.createTime,
        updatedTime: payload.updatedTime,
        email: payload.email,
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
      appid: 'wx38d5bb2c8e543695',
      secret: 'd398212a6e1fedba473e8c8c76e84e68',
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
}
