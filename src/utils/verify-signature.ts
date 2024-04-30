import { verifyTypedData } from 'viem';
import { RegisterUserDto } from '../users/dto/register-user.dto';

export const domain = {
  chainId: 56,
  name: 'General Mouse Batten',
  verifyingContract: '0x1E43682CC97320c61e5f676D1043370F39CDE859',
  version: '1',
} as const;

export const types = {
  User: [
    { name: 'wallet', type: 'address' },
    { name: 'referrer', type: 'address' },
    { name: 'timestamp', type: 'uint256' },
  ],
} as const;

export const verifySignature = async (data: RegisterUserDto) => {
  const valid = await verifyTypedData({
    domain: domain,
    types: types,
    message: {
      wallet: data.wallet as any,
      referrer: data.referrer as any,
      timestamp: data.timestamp as any,
    },
    primaryType: 'User',
    address: data.wallet as any,
    signature: data.signature as any,
  });

  return valid;
};
