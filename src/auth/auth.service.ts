import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
import { JWT } from 'src/enums'

@Injectable()
export class AuthService {
  constructor (
    private readonly httpService: HttpService,
    private jwtService: JwtService
  ) {}

  async openid2Token (openid: string) {
    return await this.jwtService.signAsync({
      openid
    })
  }

  async token2openid (token: string): Promise<string | null> {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        { secret: JWT.secret }
      )
      return payload.openid
    } catch {
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
