import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { verifySignature } from '../utils/verify-signature';
import {
  createPublicClient,
  http,
  getContract,
  PrivateKeyAccount,
  zeroAddress,
} from 'viem';
import { bsc, bscTestnet } from 'viem/chains';
import { rewardABI } from './dto/reward.abi';
import { privateKeyToAccount } from 'viem/accounts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  contract: any;
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });

    const rewardContract = this.configService.get('REWARD_CONTRACT');

    const contract = getContract({
      address: rewardContract,
      abi: rewardABI,
      client: publicClient as never,
    });

    this.contract = contract;
  }

  async register(data: RegisterUserDto) {
    const verified = verifySignature(data);

    if (!verified) {
      throw new BadRequestException('Invalid signature');
    }

    const existedUser = await this.usersRepository.findOne({
      wallet: data.wallet.toLowerCase(),
    });

    if (existedUser) {
      return existedUser;
    } else {
      const referrer =
        data.referrer.toLowerCase() === data.wallet.toLowerCase()
          ? zeroAddress
          : data.referrer.toLowerCase();
      return this.usersRepository.create({
        wallet: data.wallet.toLowerCase(),
        referrer: referrer,
        timestamp: data.timestamp,
        signature: data.signature,
      });
    }
  }

  async getUserByAddress(address: string) {
    const user = await this.usersRepository.findOne({
      wallet: address.toLowerCase(),
    });
    if (!user) {
      return {};
    }
    return user;
  }

  async getTotalReferralHistory(address: string) {
    const referrals = await this.usersRepository.find({
      referrer: address.toLowerCase(),
    });

    const referalAddresses = referrals.map((r) => r.wallet);

    // Fetch reward Status
    const rewardStatus = await this.contract.read.checkClaimedRewards([
      referalAddresses,
    ]);

    // Update reward status
    referrals.forEach((r, i) => {
      r.isClaimed = rewardStatus[i] ? true : false;
    });

    return referrals;
  }

  async getStats(address: string) {
    const totalReferral = await this.usersRepository.count({
      referrer: address.toLowerCase(),
    });

    return {
      totalReferral,
    };
  }

  async generateClaimSignature(address: string) {
    // Find referals that are not claimed
    const referrals = await this.usersRepository.find({
      referrer: address.toLowerCase(),
    });

    if (referrals.length === 0) {
      throw new BadRequestException('No referral to claim');
    }

    // Validate referrals and generate signature

    const validated = await this.contract.read.checkValidClaim([
      referrals.map((r) => r.wallet),
    ]);

    // Generate signature for validated referals max 20

    const claimable = referrals.filter((r, i) => validated[i]);

    const domains = {
      name: 'GMBReward',
      version: '1',
      chainId: 97,
      verifyingContract: this.contract.address,
    };

    const types = {
      Claim: [
        { name: 'referer', type: 'address' },
        { name: 'referral', type: 'address' },
      ],
    };

    const privateKey = this.configService.get('PRIVATE_KEY');

    const account = privateKeyToAccount(privateKey);
    const claims: {
      referral: string;
      signature: string;
    }[] = [];

    for (let i = 0; i < claimable.length; i++) {
      if (i > 20) {
        break;
      }
      const claim = claimable[i];
      const message = {
        referer: address,
        referral: claim.wallet,
      };

      const signature = await account.signTypedData({
        domain: domains,
        types: types,
        message: message,
        primaryType: 'Claim',
      });

      claims.push({
        referral: claim.wallet,
        signature: signature as unknown as string,
      });
    }

    return {
      ...claims,
    };
  }
}
