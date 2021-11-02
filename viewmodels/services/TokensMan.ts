import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../../common/ERC20';
import { IToken } from '../../common/Tokens';
import { Networks } from '../../common/Networks';
import { providers } from 'ethers';

export interface UserToken extends IToken {
  order?: number;
  shown?: boolean;
}

export default class TokensMan {
  static async loadUserTokens(chainId: number, account: string, provider: providers.BaseProvider) {
    const popTokens = Networks.find((n) => n.chainId === chainId)?.defaultTokens ?? [];
    const customized: UserToken[] = JSON.parse((await AsyncStorage.getItem(`${chainId}-${account}`)) || '[]');

    const tokens = customized.length === 0 ? popTokens : customized;
    return tokens.map((t) => new ERC20Token({ ...t, owner: account, chainId, contract: t.address, provider }));
  }
}
