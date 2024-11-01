import { SetMetadata } from '@nestjs/common'
import { StaticKey } from 'src/enums'

export const Public = () => SetMetadata(StaticKey.public, true)
