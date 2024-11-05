import { SetMetadata } from '@nestjs/common'
import { isPublicKey } from '../config'

export const Public = () => SetMetadata(isPublicKey, true)
