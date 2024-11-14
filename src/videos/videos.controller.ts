import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { VideosService } from './videos.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { uploadFileSize, uploadFilePath } from 'src/common/config'
import { extname } from 'path'
import { VideoTypeDtoOptional, VideoUploadDto } from 'src/common/dto/videos.dto'
import { unlinkSync } from 'fs'

@Controller('videos')
export class VideosController {
  constructor (
    private readonly videosService: VideosService
  ) {}

  @Get()
  async getVideoList (
    @Query() query: VideoTypeDtoOptional
  ) {
    const list = await this.videosService.getVideoList(query.type)
    return list
  }

  @Get('/:id')
  async getVideoDetail (@Param('id') id: number) {
    const detail = await this.videosService.getVideoDetail(id)
    return detail
  }

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadFilePath,
        filename: (_, file, callback) => {
          const filename = Date.now() + extname(file.originalname)
          callback(null, filename)
        }
      }),
      limits: { fileSize: uploadFileSize }
    })
  )
  async uploadVideo (
    @Body() { title, description, type }: VideoUploadDto,
    @UploadedFile() file
  ) {
    const hash = await this.videosService.calculateFileHash(file.path)
    const existingVideo = await this.videosService.findByHash(hash)
    if (existingVideo) {
      unlinkSync(file.path)
      throw new HttpException('文件已经存在', HttpStatus.OK)
    } else {
      return await this.videosService.addVideo(title, description, file.path, type, hash)
    }
  }
}
