import {
    IsEmail,
    IsNotEmpty,
  } from 'class-validator';
  
  export default class ResetPasswordRequest {
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
  }
  