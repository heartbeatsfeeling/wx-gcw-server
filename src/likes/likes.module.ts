import { Module } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { AuthModule } from 'src/auth/auth.module'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [LikesController],
  providers: [LikesService]
})
export class LikesModule {}
