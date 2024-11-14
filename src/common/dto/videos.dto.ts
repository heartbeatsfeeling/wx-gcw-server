import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { VideoType } from 'src/enums'

export class VideoTypeDto {
    @IsEnum(VideoType) // 验证是否为 VideoType 的值
    type: VideoType // 可选字段
}

export class VideoTypeDtoOptional {
    @IsOptional() // 可选
    @IsEnum(VideoType) // 验证是否为 VideoType 的值
    type?: VideoType // 可选字段
}

export class VideoUploadDto extends VideoTypeDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    description: string
}
