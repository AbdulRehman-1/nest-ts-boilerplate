import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be of minimum 6 characters' })
  @MaxLength(20, { message: 'Password must be of minimum 20 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  confirmPassword: string;
}
