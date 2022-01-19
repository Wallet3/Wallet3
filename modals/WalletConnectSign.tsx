import React, { useEffect, useRef, useState } from 'react';

import App from '../viewmodels/App';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sign from './compositions/Sign';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';
import { utils } from 'ethers';

interface Props {
  request: WCCallRequestRequest;
  close: Function;
  client: WalletConnect_v1;
  biometricEnabled?: boolean;
}

export default observer(({ request, client, close, biometricEnabled }: Props) => {
  const [msg, setMsg] = useState<string>();
  const [typedData, setTypedData] = useState();
  const [type, setType] = useState('');
  const [verified, setVerified] = useState(false);

  const themeColor = client.findTargetNetwork({ networks: Networks.all, defaultNetwork: Networks.current }).color;

  useEffect(() => {
    const { params, method } = request;
    setMsg(undefined);
    setTypedData(undefined);

    try {
      switch (method) {
        case 'eth_sign':
          setMsg(Buffer.from(utils.arrayify(params[1])).toString('utf8'));
          setType('plaintext');
          break;
        case 'personal_sign':
          setMsg(Buffer.from(utils.arrayify(params[0])).toString('utf8'));
          setType('plaintext');
          break;
        case 'eth_signTypedData':
          setTypedData(JSON.parse(params[1]));
          setType('typedData');
          break;
      }
    } catch (error) {
      close();
    }
  }, [request]);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sign = async (pin?: string) => {
    if (!client.lastUsedAccount && !client.accounts.includes(App.currentAccount?.address ?? '')) {
      showMessage({ message: `Current account rejects this dapp's request, please switch current account`, type: 'warning' });
      return false;
    }

    const { wallet, accountIndex } = App.findWallet(client.lastUsedAccount || App.currentAccount!.address) || {};
    if (!wallet || accountIndex === undefined) {
      showMessage({ message: 'Account not found, maybe it is removed', type: 'warning' });
      return false;
    }

    console.log({ pin, accountIndex });

    const signed = typedData
      ? await wallet.signTypedData({ typedData, pin, accountIndex })
      : await wallet.signMessage({ msg: msg!, pin, accountIndex });

    if (signed) {
      client.approveRequest(request.id, signed);
      setVerified(true);
      (reject as any) = undefined;
      setTimeout(() => close(), 1750);
    }

    return signed ? true : false;
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {verified ? (
        <Success />
      ) : (
        <Sign
          msg={msg}
          type={type}
          themeColor={themeColor}
          onReject={reject}
          onSign={sign}
          sign={sign}
          typedData={typedData}
          biometricEnabled
          account={App.findAccount(client.lastUsedAccount) || App.currentAccount!}
        />
      )}
    </SafeAreaProvider>
  );
});
