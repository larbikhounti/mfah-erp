import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { SignInRequestDto, SignInResponseDto } from '../dtos/auth.dto';

import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePassword, hashPassword } from 'src/helpers/helper.helpers';
import { Users } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService, // ConfigService to access environment variables
    private readonly prisma: PrismaService, // Inject PrismaService
  ) {}

  async signIn(
    signInDto: SignInRequestDto,
    response: Response,
  ): Promise<SignInResponseDto> {
    const user = await this.usersService.findOne(signInDto.email);

    if (!signInDto.email || !signInDto.password || !user) {
      throw new UnauthorizedException('Email and password are required');
    }

    if (!(await comparePassword(signInDto.password, user.password))) {
      // this.logger.warn(`Failed login attempt with invalid password for email: ${signInDto.email}`);
      throw new UnauthorizedException();
    }

    const { accessToken } = await this.generateTokens(user);

    // update user refresh token
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        accessToken: await hashPassword(accessToken),
      },
    });

    return {
      email: user.email,
      name: user.name,
      access_token: accessToken,
    };
  }

  async logout(response: Response): Promise<{ message: string }> {
    const accessToken = response.req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Access token is required');
    }

    // get the user
    const payload = await this.jwtService.verifyAsync(accessToken, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }
    // Find the user associated with the access token
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Clear the refresh token in the database first
    await this.prisma.users.update({
      where: { email: user.email },
      data: { accessToken: '' },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  // auth.service.ts
  async generateTokens(user: Users): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });

    return { accessToken };
  }
}
