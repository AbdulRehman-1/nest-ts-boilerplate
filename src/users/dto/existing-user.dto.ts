import { IsEmail, IsNotEmpty } from 'class-validator';

export default class ExistingUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
