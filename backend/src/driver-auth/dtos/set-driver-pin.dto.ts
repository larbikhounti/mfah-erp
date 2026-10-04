import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PIN_LENGTH } from '../driver-auth.constants';

export class SetDriverPinDto {
  @ApiProperty({ example: '123456', description: `${PIN_LENGTH}-digit PIN` })
  @Matches(new RegExp(`^\\d{${PIN_LENGTH}}$`), {
    message: `pin must be exactly ${PIN_LENGTH} digits`,
  })
  pin: string;
}
