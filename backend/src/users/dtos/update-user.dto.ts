import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'newpassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

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
