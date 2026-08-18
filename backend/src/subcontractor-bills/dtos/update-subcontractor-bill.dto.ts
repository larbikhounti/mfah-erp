import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class UpdateSubcontractorBillDto {
  @ApiProperty({ description: 'Bill issue date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  issueDate?: Date;

  @ApiProperty({ description: 'Payment due date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
