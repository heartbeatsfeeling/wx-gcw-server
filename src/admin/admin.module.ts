import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  exports: [AdminService],
  providers: [AdminService]
})
export class AdminModule {}
