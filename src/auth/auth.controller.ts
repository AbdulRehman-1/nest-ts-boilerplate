import {
  Body,
  Controller,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import AuthService from './auth.service';
import UsersService from '../users/users.service';
import { CreateUserDto as RegisterUserDto } from '../users/dto';
import {
  SignInDto,
  ResetPasswordDto,
  ResetPasswordRequestDto,
} from './dto';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() registerUserDto: RegisterUserDto) {






    
    return this.usersService.createUser(registerUserDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordRequest(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ) {
    return this.authService.resetPasswordRequest(resetPasswordDto);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() newPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(newPasswordDto, token);
  }
}
