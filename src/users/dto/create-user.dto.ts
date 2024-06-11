import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export default class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be of minimum 6 characters' })
  @MaxLength(20, { message: 'Password must be of minimum 20 characters' })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
