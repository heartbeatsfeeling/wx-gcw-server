import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class RoleBaseDto {
  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissions?: number[]
}
