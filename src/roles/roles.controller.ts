import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RoleBaseDto } from 'src/common/dto/roles.dto'

@Controller('roles')
export class RolesController {
  constructor (
    private rolesService: RolesService
  ) {
  }

  @Get()
  findAll () {
    return this.rolesService.findRoles()
  }

  @Post()
  @HttpCode(200)
  add (
    @Body() body: RoleBaseDto
  ) {
    return this.rolesService.add(body)
  }

  @Put(':id')
  update (
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleBaseDto
  ) {
    return this.rolesService.update({ id, name: body.name, description: body.description, permissions: body.permissions })
  }

  @Delete(':id')
  delete (
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.rolesService.delete(id)
  }
}
