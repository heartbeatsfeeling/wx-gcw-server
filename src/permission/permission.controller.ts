import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionsBaseDto } from 'src/common/dto/permissions.dto'

@Controller('permissions')
export class PermissionController {
  constructor (
    private permissionService: PermissionService
  ) {}

  @Get()
  findAll () {
    return this.permissionService.findPermissions()
  }

  @Post()
  @HttpCode(200)
  add (
    @Body() body: PermissionsBaseDto
  ) {
    return this.permissionService.add(body)
  }

  @Put(':id')
  update (
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PermissionsBaseDto
  ) {
    return this.permissionService.update({ id, ...body })
  }

  @Delete(':id')
  delete (
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.permissionService.delete(id)
  }
}
