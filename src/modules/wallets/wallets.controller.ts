import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletsService } from './wallets.service';

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  async getBalance(@Request() req: any) {
    return this.walletsService.getBalance(req.user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user wallet details' })
  async getWallet(@Request() req: any) {
    return this.walletsService.getWallet(req.user.id);
  }
}
