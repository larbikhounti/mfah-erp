import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserByAdminDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strongpassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The role ID of the user',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  role_id?: number;

  @ApiProperty({
    description: 'The DOM ID of the user',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  dom_id?: number;
}
