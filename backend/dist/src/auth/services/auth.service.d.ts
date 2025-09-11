import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { SignInRequestDto, SignInResponseDto } from '../dtos/auth.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { Users } from '@prisma/client';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly configService;
    private readonly prisma;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    signIn(signInDto: SignInRequestDto, response: Response): Promise<SignInResponseDto>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    generateTokens(user: Users): Promise<{
        accessToken: string;
    }>;
}
