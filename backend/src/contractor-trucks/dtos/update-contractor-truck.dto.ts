import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateContractorTruckDto {
  @ApiProperty({ description: 'Vehicle plate number', required: false })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiProperty({
    description: 'Subcontractor this truck belongs to',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subcontractorId?: number;
}
