import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateContractorTruckDto {
  @ApiProperty({ description: 'Vehicle plate number', example: '12345-A-6' })
  @IsNotEmpty()
  @IsString()
  plateNumber: string;

  @ApiProperty({
    description: 'Subcontractor this truck belongs to',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subcontractorId: number;
}
