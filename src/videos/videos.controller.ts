import { Controller, Get, Param } from '@nestjs/common'
import { VideosService } from './videos.service'

@Controller('videos')
export class VideosController {
  constructor (
    private readonly videosService: VideosService
  ) {}

  @Get()
  async getVideoList () {
    const list = await this.videosService.getVideoList()
    return list
  }

  @Get('/:id')
  async getVideoDetail (@Param('id') id: number) {
    const detail = await this.videosService.getVideoDetail(id)
    return detail
  }
}
