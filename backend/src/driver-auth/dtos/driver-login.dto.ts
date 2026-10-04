import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PIN_LENGTH } from '../driver-auth.constants';

export class DriverLoginDto {
  @ApiProperty({ example: '0612345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @Matches(new RegExp(`^\\d{${PIN_LENGTH}}$`), {
    message: `pin must be exactly ${PIN_LENGTH} digits`,
  })
  pin: string;
}
