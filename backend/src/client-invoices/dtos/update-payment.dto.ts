import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdatePaymentDto {
  @ApiProperty({ description: 'Total amount paid so far', example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountPaid: number;
}
