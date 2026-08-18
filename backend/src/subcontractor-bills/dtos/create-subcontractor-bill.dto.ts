import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

// amount/currency/subcontractorId are derived from the mission, not entered
// here — see SubcontractorBillsService.create(). This is always a manual
// action: it's triggered by actually receiving the subcontractor's PDF bill.
export class CreateSubcontractorBillDto {
  @ApiProperty({ description: 'Mission this bill is for', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  missionId: number;

  @ApiProperty({
    description: 'Bill issue date',
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
