import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { join } from 'path'

@Controller('admin') // 注意这里不指定路径
export class AdminController {
  @Get()
  getAdminPage (@Res() res: Response) {
    // 返回 admin.html 文件
    return res.sendFile(join(__dirname, '/', 'public', 'admin.html'))
  }
}
