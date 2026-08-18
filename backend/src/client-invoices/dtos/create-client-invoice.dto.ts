import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

// amount/currency/clientId are derived from the mission, not entered here —
// see ClientInvoicesService.create().
export class CreateClientInvoiceDto {
  @ApiProperty({ description: 'Mission this invoice bills', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  missionId: number;

  @ApiProperty({
    description: 'Invoice issue date',
    example: '2026-09-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  issueDate: Date;

  @ApiProperty({ description: 'Payment due date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
