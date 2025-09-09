import { AuthService } from '../services/auth.service';
import { SignInRequestDto } from '../dtos/auth.dto';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: SignInRequestDto, response: Response): Promise<import("../dtos/auth.dto").SignInResponseDto>;
    logout(response: Response): Promise<void>;
}
