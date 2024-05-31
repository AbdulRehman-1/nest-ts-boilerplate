import {
    IsEmail,
    IsNotEmpty,
  } from 'class-validator';
  
  export default class SignInDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    password: string;
  
  }
  