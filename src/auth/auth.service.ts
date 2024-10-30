import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '..//users/users.service'

@Injectable()
export class AuthService {
  constructor (private usersService: UsersService) {}

  async signIn (): Promise<any> {
    const user = await this.usersService.findAllUsers()
    if (!user) {
      throw new UnauthorizedException()
    }
    // const { openId } = user
    // TODO: 生成一个 JWT，并在这里返回
    // 而不是返回一个用户对象
    return user
  }
}
