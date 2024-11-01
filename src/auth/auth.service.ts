import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
import { JWT } from 'src/enums'
import { DatabaseService } from 'src/database/database.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor (
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    private databaseService: DatabaseService,
    private usersService: UsersService
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
