import { IsString, MinLength, IsEmail } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  surname: string;

  @IsString()
  @MinLength(3)
  dni: string;

  @IsString()
  @MinLength(3)
  phone: string;

  @IsEmail()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsString()
  @MinLength(3)
  city: string;
}
