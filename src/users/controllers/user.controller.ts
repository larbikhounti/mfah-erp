import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register.dto';
import { Public } from 'src/decorator/public.decorator';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  // register user
  @Public()
  //@HttpCode(HttpStatus.CREATED)
  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }
}
