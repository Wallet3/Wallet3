import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Metamask as MetamaskLogo, WalletConnect as WalletConnectLogo } from '../../assets/3rd';
import React, { useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/App';
import DAppInfo from './DAppInfo';
import { DrawerActions } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Image from 'react-native-expo-cached-image';
import { MetamaskDApp } from '../../viewmodels/walletconnect/MetamaskDApp';
import MetamaskDAppsHub from '../../viewmodels/walletconnect/MetamaskDAppsHub';
import { Modalize } from 'react-native-modalize';
import NetworkSelector from '../../modals/dapp/NetworkSelector';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import { styles } from '../../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

interface Props {
  client: WalletConnect_v1 | MetamaskDApp;
  allAccounts: Account[];
  close: Function;
}

const DApp = observer(({ client, allAccounts, close }: Props) => {
  const swiper = useRef<Swiper>(null);
  const [panel, setPanel] = useState(1);

  const [defaultAccount, setDefaultAccount] = useState(client.activeAccount);
  const [defaultNetwork, setDefaultNetwork] = useState(client.activeNetwork);

  const { backgroundColor } = Theme;

  const disconnect = () => {
    startLayoutAnimation();
    client.killSession();
    close();
  };

  const selectNetworks = (chains: number[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedChain(chains[0], true);
    setDefaultNetwork(client.activeNetwork);
  };

  const selectAccounts = (accounts: string[]) => {
    swiper.current?.scrollTo(0);
    client.setLastUsedAccount(accounts[0], true);
    setDefaultAccount(client.activeAccount);
  };

  const swipeTo = (index: number) => {
    setPanel(index);
    setTimeout(() => swiper.current?.scrollTo(1), 5);
  };

  return (
    <SafeAreaProvider style={{ flex: 1, height: 429, backgroundColor, borderRadius: 6 }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <DAppInfo
          client={client}
          defaultAccount={defaultAccount}
          defaultNetwork={defaultNetwork}
          onDisconnect={disconnect}
          onNetworkPress={() => swipeTo(1)}
          onAccountsPress={() => swipeTo(2)}
        />

        {panel === 1 ? (
          <NetworkSelector networks={Networks.all} selectedChains={client.chains} onDone={selectNetworks} single />
        ) : undefined}

        {panel === 2 ? (
          <AccountSelector
            single
            accounts={allAccounts}
            selectedAccounts={client.accounts}
            onDone={selectAccounts}
            themeColor={defaultNetwork.color}
          />
        ) : undefined}
      </Swiper>
    </SafeAreaProvider>
  );
});

const DAppItem = observer(
  ({
    textColor,
    item,
    openApp,
    secondaryTextColor,
    backgroundColor,
  }: {
    item: WalletConnect_v1 | MetamaskDApp;
    openApp: (item: WalletConnect_v1 | MetamaskDApp) => void;
    textColor: string;
    secondaryTextColor: string;
    backgroundColor: string;
  }) => {
    const { appMeta } = item;
    const { t } = i18n;

    const remove = () => {
      startLayoutAnimation();
      item.killSession();
    };

    return (
      <View
        style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor }}
      >
        <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }} onPress={() => openApp(item)}>
          <View style={{ marginEnd: 12, borderWidth: 1, borderRadius: 5, borderColor, padding: 2 }}>
            <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 27, height: 27, borderRadius: 2 }} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 17, color: textColor }} numberOfLines={1}>
              {appMeta?.name || appMeta?.url}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.isMobileApp ? (
                <Ionicons
                  name="ios-phone-portrait-outline"
                  size={9}
                  style={{ marginTop: 4, marginEnd: 3 }}
                  color={textColor}
                />
              ) : undefined}

              <Text style={{ color: secondaryTextColor, fontSize: 12, marginTop: 4 }}>
                {`${t('connectedapps-list-last-used')}: ${new Date(item.lastUsedTimestamp).toLocaleDateString()}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 12, marginEnd: -12 }} onPress={() => remove()}>
          <FontAwesome name="trash-o" size={19} color={textColor} />
        </TouchableOpacity>
      </View>
    );
  }
);

export default observer(({ navigation }: DrawerScreenProps<{}, never>) => {
  const { t } = i18n;
  const swiper = useRef<Swiper>(null);
  const scroller = useRef<FlatList>(null);
  const { ref, open, close } = useModalize();
  const { secondaryTextColor, textColor, systemBorderColor, foregroundColor, backgroundColor } = Theme;
  const [selectedClient, setSelectedClient] = useState<WalletConnect_v1 | MetamaskDApp>();
  const { top } = useSafeAreaInsets();

  const { sortedClients, connectedCount } = WalletConnectV1ClientHub;
  const { dapps } = MetamaskDAppsHub;

  const openApp = (client: WalletConnect_v1 | MetamaskDApp) => {
    setSelectedClient(client);
    setTimeout(() => open(), 5);
  };

  const renderItem = ({ item }: { item: WalletConnect_v1 | MetamaskDApp }) => (
    <DAppItem
      key={item['hostname'] || item['peerId']}
      textColor={textColor}
      item={item}
      openApp={openApp}
      secondaryTextColor={secondaryTextColor}
      backgroundColor={backgroundColor}
    />
  );

  const headerHeight = 49;

  const logos = [
    <View
      key="walletconnect"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <WalletConnectLogo width={15} height={15} />
      <Text style={{ color: '#3b99fc', fontWeight: '500', marginStart: 8, fontSize: 18 }}>{`WalletConnect`}</Text>
    </View>,
    <View
      key="metamask"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <MetamaskLogo width={12.5} height={12.5} />
      <Text style={{ color: '#f5841f', fontWeight: '500', marginStart: 8, fontSize: 18 }}>{`Metamask`}</Text>
    </View>,
  ];

  const scrollToIndex = (index: number) => {
    scroller.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.333, borderBottomColor: systemBorderColor }}
      >
        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', zIndex: 9 }}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        >
          <Feather name="menu" size={20} color={foregroundColor} style={{}} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: -2,
          }}
        >
          <FlatList
            ref={scroller}
            scrollEnabled={false}
            pagingEnabled
            data={logos}
            renderItem={({ item }) => item}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            style={{ height: headerHeight }}
          />
        </View>
      </View>

      <Swiper ref={swiper} showsPagination={false} showsButtons={false} loop={false} onIndexChanged={scrollToIndex}>
        <View style={{ width: '100%', height: '100%' }}>
          <Ionicons name="arrow-forward" size={19} color="lightgrey" style={{ position: 'absolute', right: 16, top: '45%' }} />

          {connectedCount > 0 ? (
            <FlatList
              data={sortedClients}
              renderItem={renderItem}
              keyExtractor={(i) => i.peerId}
              style={{ flex: 1 }}
              alwaysBounceVertical={false}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity style={{ padding: 12 }} onPress={() => navigation.getParent()?.navigate('QRScan')}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color={secondaryTextColor} />
              </TouchableOpacity>
              <Text style={{ color: secondaryFontColor, marginTop: 24 }}>{t('connectedapps-noapps')}</Text>
            </View>
          )}
        </View>

        <FlatList
          data={dapps}
          renderItem={renderItem}
          style={{ width: '100%', height: '100%' }}
          keyExtractor={(i) => i.hostname}
          bounces={false}
        />
      </Swiper>

      <Portal>
        <Modalize adjustToContentHeight ref={ref} disableScrollIfPossible modalStyle={styles.modalStyle}>
          {selectedClient ? <DApp client={selectedClient} allAccounts={App.allAccounts} close={close} /> : undefined}
        </Modalize>
      </Portal>
    </View>
  );
});
