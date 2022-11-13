import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import { Account } from '../viewmodels/account/Account';
import AccountSelector from './dapp/AccountSelector';
import App from '../viewmodels/core/App';
import DAppConnectView from './dapp/DAppConnectView';
import { INetwork } from '../common/Networks';
import { Ionicons } from '@expo/vector-icons';
import Loading from './views/Loading';
import NetworkSelector from './dapp/NetworkSelector';
import Networks from '../viewmodels/core/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../viewmodels/settings/Theme';
import WalletConnectV1ClientHub from '../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface DAppProps {
  client: WalletConnect_v1;
  onNetworksPress?: () => void;
  onAccountsPress?: () => void;
  close: Function;
  onConnect: () => void;

  network: INetwork;
  account?: Account;
}

const DApp = observer(({ client, onNetworksPress, onAccountsPress, close, onConnect, account, network }: DAppProps) => {
  const { t } = i18n;

  const app = client.appMeta!;

  const reject = async () => {
    close();
    await client.killSession();
    client.dispose();
  };

  if (!network) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: 'crimson', fontSize: 24 }}>{t('modal-dapp-not-supported-network')}</Text>
        </View>
        <Button title="Close" onPress={() => close()} />
      </View>
    );
  }

  return (
    <DAppConnectView
      network={network}
      account={account}
      appDesc={app.description}
      appIcon={app.icons[0]}
      appName={app.name}
      appUrl={app.url}
      disableNetworksButton={client.version > 1}
      onAccountsPress={onAccountsPress}
      onNetworksPress={onNetworksPress}
      onConnect={onConnect}
      onReject={reject}
      themeColor={network.color}
    />
  );
});

interface ConnectDAppProps {
  client: WalletConnect_v1;
  close: Function;
  extra?: { fromMobile?: boolean; hostname?: string };
}

const ConnectDApp = observer(({ client, close }: ConnectDAppProps) => {
  const swiper = useRef<Swiper>(null);
  const [panel, setPanel] = useState(1);
  const [account, setAccount] = useState(client.activeAccount);
  const [network, setNetwork] = useState(client.activeNetwork);

  const selectNetworks = (chains: number[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedChain(chains[0]);
    setNetwork(client.activeNetwork);
  };

  const selectAccounts = (accounts: string[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedAccount(accounts[0]);
    setAccount(client.activeAccount);
  };

  const connect = () => {
    client.approveSession();
    close();
  };

  const swipeTo = (index: number) => {
    setPanel(index);
    setTimeout(() => swiper.current?.scrollTo(1), 25);
  };

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <DApp
        client={client}
        close={close}
        onNetworksPress={() => swipeTo(1)}
        onAccountsPress={() => swipeTo(2)}
        onConnect={connect}
        account={account}
        network={network}
      />

      {panel === 1 ? (
        <NetworkSelector single networks={Networks.all} selectedChains={client.chains} onDone={selectNetworks} />
      ) : undefined}

      {panel === 2 ? (
        <AccountSelector
          single
          accounts={App.allAccounts}
          selectedAccounts={client.accounts}
          onDone={selectAccounts}
          themeColor={network.color}
        />
      ) : undefined}
    </Swiper>
  );
});

const TimeoutView = ({ close, msg }: { close: Function; msg?: string }) => {
  const { t } = i18n;

  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="timer-outline" color="crimson" size={72} />
        <Text style={{ fontSize: 24, color: 'crimson', marginTop: 12 }}>{msg ?? t('modal-dapp-connection-timeout')}</Text>
        <Text style={{ fontSize: 17, color: 'crimson', marginTop: 12 }}>{t('modal-dapp-connection-refresh-again')}</Text>
      </View>
      <Button title="Close" onPress={() => close()} />
    </SafeViewContainer>
  );
};

interface Props {
  uri?: string;
  extra: { fromMobile?: boolean; hostname?: string };
  close: Function;
}

export default observer(({ uri, close, extra }: Props) => {
  const [connecting, setConnecting] = useState(true);
  const [connectTimeout, setConnectTimeout] = useState(false);
  const [client, setClient] = useState<WalletConnect_v1>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const { backgroundColor } = Theme;
  const { t } = i18n;

  useEffect(() => {
    if (!uri) return;
    if (client) return;
    
    let wc_client = WalletConnectV1ClientHub.connect(uri, extra);
    if (!wc_client) {
      setErrorMsg(t('modal-dapp-connection-wc-failed'));
      setConnectTimeout(true);
      return;
    }

    const timeout = setTimeout(async () => {
      setConnectTimeout(true);
      setConnecting(false);
      setClient(undefined);
      await wc_client?.killSession();
      wc_client?.dispose();
      wc_client = undefined;
    }, 15 * 1000);

    wc_client?.once('sessionRequest', () => {
      clearTimeout(timeout);
      setConnecting(false);
      setClient(wc_client!);
    });
  }, [uri]);

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      {connecting && !connectTimeout ? <Loading /> : undefined}
      {client ? <ConnectDApp client={client} close={close} extra={extra} /> : undefined}
      {connectTimeout ? <TimeoutView close={close} msg={errorMsg} /> : undefined}
    </SafeAreaProvider>
  );
});
