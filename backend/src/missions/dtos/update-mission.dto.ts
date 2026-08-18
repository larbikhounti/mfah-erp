import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Currency, ExecutionMode, TransportType } from '@prisma/client';

// Cross-field consistency (executionMode vs truck/driver/subcontractor) is
// re-validated in the service against the merged final state, since on a
// partial update we can't tell from the DTO alone whether executionMode is
// changing.
export class UpdateMissionDto {
  @ApiProperty({ description: 'Client ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clientId?: number;

  @ApiProperty({
    description: 'Transport type',
    enum: TransportType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;

  @ApiProperty({
    description: 'Execution mode',
    enum: ExecutionMode,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode;

  @ApiProperty({ description: 'Loading location', required: false })
  @IsOptional()
  @IsString()
  loadingLocation?: string;

  @ApiProperty({ description: 'Delivery location', required: false })
  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @ApiProperty({ description: 'Price billed to the client', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  clientPrice?: number;

  @ApiProperty({ description: 'Currency', enum: Currency, required: false })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ description: 'Subcontractor ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subcontractorId?: number;

  @ApiProperty({
    description: 'Cost paid to the subcontractor',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subcontractorCost?: number;

  @ApiProperty({ description: 'Truck ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  truckId?: number;

  @ApiProperty({ description: 'Driver ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driverId?: number;

  @ApiProperty({ description: 'Scheduled mission date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  missionDate?: Date;

  @ApiProperty({
    description: 'Automatically create the client invoice',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoInvoice?: boolean;
}
