import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() data: RegisterUserDto) {
    console.log('data', data);
    const registered = await this.usersService.register(data);
    console.log('registered', registered);
    return registered;
  }

  @Get('history/:address')
  async getTotalReferralHistory(@Param('address') address: string) {
    const history = await this.usersService.getTotalReferralHistory(address);
    return history;
  }

  @Get('stats/:address')
  async getStats(@Param('address') address: string) {
    const st = await this.usersService.getStats(address);
    return st;
  }

  @Get('claim/:address')
  async getClaims(@Param('address') address: string) {
    const st = await this.usersService.generateClaimSignature(address);
    return st;
  }

  @Get(':address')
  async getUserByAddress(@Param('address') address: string) {
    const user = await this.usersService.getUserByAddress(address);
    return user;
  }
}
