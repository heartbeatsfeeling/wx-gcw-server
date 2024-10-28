import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.findAllUsers();
  }

  @Post()
  async create(@Body() body: { name: string; age: number }) {
    return await this.userService.createUser(body.name, body.age);
  }
}
