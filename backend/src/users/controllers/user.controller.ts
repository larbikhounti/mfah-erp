import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register.dto';
import { Public } from 'src/decorator/public.decorator';
import { UsersService } from '../services/users.service';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  // get all users
 // @ApiBearerAuth("access-token")
  @Public()
  @Get('all')
  getAllUsers(@Query() filterParams: FilterParamsDto) {
    return this.usersService.findAll(filterParams);
  }

  // register user
  @Public()
  //@HttpCode(HttpStatus.CREATED)
  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }
}
