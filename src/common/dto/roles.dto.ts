import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class RoleBaseDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissions?: number[]
}
