import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { VideosService } from './videos.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { uploadFileSize, uploadFilePath } from 'src/common/config'
import { extname } from 'path'
import { VideoTypeDtoOptional, VideoUploadDto } from 'src/common/dto/videos.dto'
import { unlinkSync } from 'fs'
import { randomUUID } from 'crypto'

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

  @Get(':id')
  async getVideoDetail (@Param('id') id: number) {
    const detail = await this.videosService.getVideoDetail(id)
    return detail
  }

  @Post('add')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadFilePath,
        filename: (_, file, callback) => {
          console.log('file', file)
          callback(null, 'abc.mp1')
        }
      }),
      limits: { fileSize: uploadFileSize }
    })
  )
  async addVideo (
    @Body() { title, description, type }: VideoUploadDto,
    @UploadedFile() file
  ) {
    console.log('上传成功')
    const hash = await this.videosService.calculateFileHash(file.path)
    console.log('hash')
    const existingVideo = await this.videosService.findByHash(hash)
    if (existingVideo) {
      unlinkSync(file.path)
      throw new HttpException('文件已经存在', HttpStatus.OK)
    } else {
      console.log('hash1')
      return await this.videosService.addVideo(title, description, file.path, type, hash)
    }
  }

  @Delete(':id')
  async deleteVideo (
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.videosService.deleteVideo(id)
  }
}
