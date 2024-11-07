import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import { jwtConfig } from 'src/common/config'
import { AdminUserPayLoad, wxUserPayLoad } from 'types/payload'

@Injectable()
export class AuthService {
  constructor (
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    private usersService: UsersService
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

  async getAdminJWTPayload (token: string): Promise<AdminUserPayLoad> {
    const payload = await this.jwtVerify<AdminUserPayLoad>(token)
    if (payload) {
      return {
        userName: payload.userName,
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

  async adminLogin (userName: string, password: string) {
    const user = await this.usersService.findAdminUser(userName, password)
    if (user?.password !== password) {
      return {
        status: false,
        message: '用户不存在或密码错误'
      }
    }
    const payload = { userName: user.name, userId: user.id }
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload)
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
