import { Module } from '@nestjs/common'
import { VideosService } from './videos.service'
import { VideosController } from './videos.controller'
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule {}
