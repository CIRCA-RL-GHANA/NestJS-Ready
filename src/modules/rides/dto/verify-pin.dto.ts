import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPINDto {
  @ApiProperty({ description: 'PIN code', example: '123456' })
  @IsString()
  @Length(4, 6)
  pin: string;
}
