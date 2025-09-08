import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { hashPassword } from 'src/helpers/helper.helpers';
import { Users } from 'generated/prisma';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegisterUserDto): Promise<string | Error> {
    try {
      const hashedPassword = await hashPassword(data.password);
      await this.prisma.users.create({
        data: {
          ...data,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return `User created successfully`;
    } catch (error) {
      console.error('Error creating user:', error);
      return new HttpException('Error creating user', 500);
    }
  }

  async findOne(email: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findUnique({
        where: { email },
      });
    } catch (error: any) {
      this.logger.error('Error finding user', error);
      throw new HttpException(
        'email or password is incorrect',
        HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      );
    }
  }
}
