import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
