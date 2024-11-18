import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { VideosService } from './videos.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { uploadFileSize, uploadFilePath } from 'src/common/config'
import { extname } from 'path'
import { VideoTypeDtoOptional, VideoUploadDto } from 'src/common/dto/videos.dto'
import { unlinkSync } from 'fs'
import { randomUUID } from 'crypto'
import { AuthService } from 'src/auth/auth.service'
import { DatabaseService } from 'src/database/database.service'
import { User } from 'types/db'

@Controller('videos')
export class VideosController {
  constructor (
    private readonly videosService: VideosService,
    private readonly authService: AuthService,
    private readonly databaseService: DatabaseService

  ) {}

  @Get()
  async getVideoList (
    @Query() query: VideoTypeDtoOptional
  ) {
    const list = await this.videosService.getVideoList(query.type)
    return list
  }

  @Get(':id')
  async getVideoDetail (
    @Param('id') id: number,
    @Headers('token') token?: string
  ) {
    const openid = await this.authService.token2openid(token)
    let userId: undefined | number
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      userId = user?.id
    }
    const detail = await this.videosService.getVideoDetail(id, userId)
    return detail
  }

  @Post('add')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadFilePath,
        filename: (_, file, callback) => {
          const filename = `${randomUUID()}${extname(file.originalname)}`
          callback(null, filename)
        }
      }),
      limits: { fileSize: uploadFileSize }
    })
  )
  async addVideo (
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

  @Delete(':id')
  async deleteVideo (
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.videosService.deleteVideo(id)
  }
}
