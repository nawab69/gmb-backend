import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  wallet: string;

  @IsString()
  @IsNotEmpty()
  referrer?: string;

  @IsNumber()
  timestamp?: string;

  @IsString()
  @IsNotEmpty()
  signature?: string;
}
