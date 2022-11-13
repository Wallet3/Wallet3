import * as ExpoLinking from 'expo-linking';

import React, { useEffect, useState } from 'react';

import App from '../viewmodels/core/App';
import Authentication from '../viewmodels/auth/Authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sign from './compositions/Sign';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import Success from './views/Success';
import Theme from '../viewmodels/settings/Theme';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { parseSignParams } from '../utils/sign';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';

interface Props {
  request: WCCallRequestRequest;
  close: Function;
  client: WalletConnect_v1;
}

export default observer(({ request, client, close }: Props) => {
  const [msg, setMsg] = useState<string | Uint8Array>();
  const [typedData, setTypedData] = useState();
  const [type, setType] = useState<'plaintext' | 'typedData'>();
  const [verified, setVerified] = useState(false);
  const { backgroundColor } = Theme;

  const themeColor = client.activeNetwork.color;

  useEffect(() => {
    const { params, method } = request;
    setMsg(undefined);
    setTypedData(undefined);

    try {
      switch (method) {
        case 'eth_sign':
        case 'personal_sign':
          const { data } = parseSignParams(params, method === 'eth_sign');

          setMsg(data);
          setType('plaintext');
          break;
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
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

  const sign = async ({ pin, standardMode }: { pin?: string; standardMode?: boolean } = {}) => {
    if (!client.lastUsedAccount) {
      showMessage({ message: i18n.t('msg-no-account-authorized-to-dapp'), type: 'warning' });
      return false;
    }

    const { wallet, accountIndex } = App.findWallet(client.lastUsedAccount || App.currentAccount!.address) || {};
    if (!wallet || accountIndex === undefined) {
      showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
      return false;
    }

    const signed = typedData
      ? await wallet.signTypedData({ typedData, pin, accountIndex, version: SignTypedDataVersion.V4 })
      : await wallet.signMessage({ msg: msg!, pin, accountIndex, standardMode });

    if (signed) {
      client.approveRequest(request.id, signed);
      setVerified(true);
      (reject as any) = undefined;
      setTimeout(() => close(), 1750);
    }

    return signed ? true : false;
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
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
          biometricType={Authentication.biometricType}
          account={client.activeAccount!}
          metadata={{
            icon: client.appMeta?.icons?.[0] || '',
            origin: client.origin || client.appMeta?.url || '',
            title: client.appMeta?.name || client.appMeta?.url || '',
          }}
        />
      )}
    </SafeAreaProvider>
  );
});
