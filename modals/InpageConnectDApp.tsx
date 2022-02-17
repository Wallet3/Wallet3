import React, { useRef, useState } from 'react';

import { Account } from '../viewmodels/account/Account';
import AccountSelector from './dapp/AccountSelector';
import App from '../viewmodels/App';
import DAppConnectView from './dapp/DAppConnectView';
import { INetwork } from '../common/Networks';
import NetworkSelector from './dapp/NetworkSelector';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../viewmodels/settings/Theme';
import { isSecureSite } from '../viewmodels/customs/Bookmarks';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  close: () => void;
  approve?: (userSelected: { network: INetwork; account: Account }) => void;
  reject?: () => void;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appUrl?: string;
}

const ConnectPivot = observer(
  ({
    appName,
    appDesc,
    appIcon,
    appUrl,
    onApprove,
    onReject,
  }: {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appUrl?: string;
    onApprove: (userSelected: { account: Account; network: INetwork }) => void;
    onReject: () => void;
  }) => {
    const swiper = useRef<Swiper>(null);
    const [panel, setPanel] = useState(1);
    const [account, setAccount] = useState(App.currentAccount!);
    const [selectedNetwork, setSelectedNetwork] = useState(Networks.current);

    const approve = () => onApprove({ account, network: selectedNetwork });

    const onSelectNetworksDone = (chains: number[]) => {
      swiper.current?.scrollTo(0);
      setSelectedNetwork(Networks.find(chains[0])!);
    };

    const onSelectAccountsDone = (accounts: string[]) => {
      swiper.current?.scrollTo(0);
      setAccount(App.findAccount(accounts[0])!);
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
        <DAppConnectView
          onNetworksPress={() => swipeTo(1)}
          onAccountsPress={() => swipeTo(2)}
          onConnect={approve}
          onReject={onReject}
          account={account}
          network={selectedNetwork}
          appName={appName}
          appDesc={appDesc}
          appIcon={appIcon}
          appUrl={appUrl}
          themeColor={selectedNetwork.color}
          isVerified={isSecureSite(appUrl ?? '')}
        />

        {panel === 1 ? (
          <NetworkSelector
            networks={Networks.all}
            selectedChains={[selectedNetwork.chainId]}
            onDone={onSelectNetworksDone}
            single
          />
        ) : undefined}

        {panel === 2 ? (
          <AccountSelector
            single
            accounts={App.allAccounts}
            selectedAccounts={[account.address]}
            onDone={onSelectAccountsDone}
            themeColor={selectedNetwork.color}
          />
        ) : undefined}
      </Swiper>
    );
  }
);

export default observer((props: Props) => {
  const { approve, reject, close, appName, appDesc, appIcon, appUrl } = props;
  const { backgroundColor } = Theme;
  const onConnect = (userSelected: { network: INetwork; account: Account }) => {
    approve?.(userSelected);
    close();
  };

  const onReject = () => {
    reject?.();
    close();
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      <ConnectPivot {...props} onApprove={onConnect} onReject={onReject} />
    </SafeAreaProvider>
  );
});
