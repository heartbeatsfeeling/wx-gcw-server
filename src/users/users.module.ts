import { Module } from '@nestjs/common'
import { UserController } from './users.controller'
import { UsersService } from './users.service'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UsersService]
})
export class UsersModule {}
