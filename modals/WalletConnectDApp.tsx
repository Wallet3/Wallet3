import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import { Account } from '../viewmodels/account/Account';
import AccountSelector from './dapp/AccountSelector';
import App from '../viewmodels/App';
import DAppConnectView from './dapp/DAppConnectView';
import { Ionicons } from '@expo/vector-icons';
import Loading from './views/Loading';
import NetworkSelector from './dapp/NetworkSelector';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
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
  accounts: Account[];
  currentAccount?: Account;
}

const DApp = observer(
  ({ client, onNetworksPress, onAccountsPress, close, onConnect, accounts, currentAccount }: DAppProps) => {
    const { t } = i18n;
    const networks = Networks.all.filter((n) => client.enabledChains.includes(n.chainId));
    const [network] = networks;

    const app = client.appMeta!;

    const account = client.accounts.includes(currentAccount?.address ?? '')
      ? currentAccount
      : accounts.find((a) => a.address === client.accounts[0]) ?? currentAccount;

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
      />
    );
  }
);

interface Props {
  uri?: string;
  extra: { fromMobile?: boolean; hostname?: string };
  close: Function;
}

const ConnectDApp = observer(({ client, close }: { client: WalletConnect_v1; close: Function }) => {
  const swiper = useRef<Swiper>(null);
  const [panel, setPanel] = useState(1);

  const selectNetworks = (chains: number[]) => {
    swiper.current?.scrollTo(0);
    client.setChains(chains);
  };

  const selectAccounts = (accounts: string[]) => {
    swiper.current?.scrollTo(0);
    client.setAccounts(accounts);
  };

  const connect = () => {
    client.approveSession();
    close();
  };

  const swipeTo = (index: number) => {
    setPanel(index);
    setTimeout(() => swiper.current?.scrollTo(1), 0);
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
        accounts={App.allAccounts}
        currentAccount={App.currentAccount!}
      />

      {panel === 1 ? (
        <NetworkSelector networks={Networks.all} selectedChains={client.enabledChains} onDone={selectNetworks} />
      ) : undefined}

      {panel === 2 ? (
        <AccountSelector accounts={App.allAccounts} selectedAccounts={client.accounts} onDone={selectAccounts} />
      ) : undefined}
    </Swiper>
  );
});

const TimeoutView = ({ close }: { close: Function }) => {
  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="timer-outline" color="crimson" size={72} />
        <Text style={{ fontSize: 24, color: 'crimson', marginTop: 12 }}>Connection Timeout</Text>
        <Text style={{ fontSize: 17, color: 'crimson', marginTop: 12 }}>Please refresh webpage and try again.</Text>
      </View>
      <Button title="Close" onPress={() => close()} />
    </SafeViewContainer>
  );
};

export default observer(({ uri, close, extra }: Props) => {
  const [connecting, setConnecting] = useState(true);
  const [connectTimeout, setConnectTimeout] = useState(false);
  const [client, setClient] = useState<WalletConnect_v1>();

  useEffect(() => {
    if (!uri) return;
    if (client) return;

    let wc_client = WalletConnectV1ClientHub.connect(uri, extra);
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
    <SafeAreaProvider style={styles.safeArea}>
      {connecting ? <Loading /> : undefined}
      {client ? <ConnectDApp client={client} close={close} /> : undefined}
      {connectTimeout ? <TimeoutView close={close} /> : undefined}
    </SafeAreaProvider>
  );
});
