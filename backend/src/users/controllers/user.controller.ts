import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register.dto';
import { Public } from 'src/decorator/public.decorator';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  // get all users
  @Get('all')
  getAllUsers(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('filter') filter?: string,
  ) {
    return this.usersService.findAll(
      parseInt(limit) || 10,
      parseInt(page) || 1,
      filter || '',
    );
  }

  // register user
  @Public()
  //@HttpCode(HttpStatus.CREATED)
  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }
}
