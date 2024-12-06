import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class AdminLoginDto {
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    captchaId: string

    @IsString()
    @IsNotEmpty()
    captchaText: string
}
export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    captchaText: string

    @IsOptional()
    @IsArray()
    @IsNumber(undefined, { each: true })
    roles?: number[]
}

export class RestPasswrodDto {
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    captchaText: string
}

export class UpdateRolesDto {
    @IsNumber()
    @IsNotEmpty()
    id: number

    @IsOptional()
    @IsArray()
    @IsNumber(undefined, { each: true })
    roles: number[]
}
