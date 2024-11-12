import { Injectable } from '@nestjs/common'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Video } from 'types/db'

@Injectable()
export class VideosService {
  constructor (
    private readonly databaseService: DatabaseService
  ) {}

  async getVideoList () {
    const sql = 'SELECT *, DATE_FORMAT(`create_time`, ?) AS `create_time` FROM `videos`'
    const list = await this.databaseService.query<Video[]>(sql, [dateFormat.format])
    return list
  }

  async getVideoDetail (id: number) {
    const sql = 'SELECT * , DATE_FORMAT(`create_time`, ?) as create_time  FROM `videos` WHERE `id` = ?'
    const detail = await this.databaseService.query<Video>(sql, [dateFormat.format, id])
    return detail?.[0] ?? null
  }
}
