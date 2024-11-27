import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, DatabaseModule],
  controllers: [AdminController],
  exports: [AdminService],
  providers: [AdminService]
})
export class AdminModule {}
