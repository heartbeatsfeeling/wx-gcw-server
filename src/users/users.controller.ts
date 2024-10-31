import { Controller, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('user')
export class UserController {
  constructor (private readonly usersService: UsersService) {}

  @Post()
  async updateUser (
    @Body('openid') openid: string
  ) {
    console.log(
      await this.usersService.findUser(openid)
    )
    return 1
  }
}
