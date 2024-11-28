import { IsNotEmpty, IsString } from 'class-validator'

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
