import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: 'The name of the game',
    example: 'Virtual Racing Championship',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The price of the game in currency units',
    example: 25.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The play time of the game in minutes',
    example: 30,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  playTime: number;

  @ApiProperty({
    description: 'The game type ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  gameTypeId?: number;

  @ApiProperty({
    description: 'The machine type ID that can run this game',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  machineTypeId?: number;
  @ApiProperty({
    description: 'The recommended age for the game',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}
