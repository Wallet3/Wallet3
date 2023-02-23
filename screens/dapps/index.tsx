import { Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/core/App';
import DAppInfo from './DAppInfo';
import { DrawerActions } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import IllustrationNoData from '../../assets/illustrations/misc/nodata.svg';
import MessageKeys from '../../common/MessageKeys';
import { MetamaskDApp } from '../../viewmodels/walletconnect/MetamaskDApp';
import MetamaskDAppsHub from '../../viewmodels/walletconnect/MetamaskDAppsHub';
import NetworkSelector from '../../modals/dapp/NetworkSelector';
import Networks from '../../viewmodels/core/Networks';
import { NullableImage } from '../../components';
import { Portal } from 'react-native-portalize';
import SquircleModalize from '../../modals/core/SquircleModalize';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import { WalletConnect as WalletConnectLogo } from '../../assets/3rd';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../../viewmodels/walletconnect/WalletConnect_v2';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

interface Props {
  client: WalletConnect_v1 | MetamaskDApp | WalletConnect_v2;
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
    <SafeAreaProvider style={{ flex: 1, height: 429 }}>
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
    item: WalletConnect_v1 | MetamaskDApp | WalletConnect_v2;
    openApp: (item: WalletConnect_v1 | MetamaskDApp | WalletConnect_v2) => void;
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
          <View
            style={{
              marginEnd: 12,
              borderWidth: 0,
              borderRadius: 5,
              borderColor,
              padding: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <NullableImage
              uri={appMeta?.icons[0]}
              size={27}
              imageRadius={2}
              text={appMeta?.name}
              containerStyle={{ width: 27, height: 27, borderRadius: 2 }}
              imageBackgroundColor={backgroundColor}
            />
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
  const [selectedClient, setSelectedClient] = useState<WalletConnect_v1 | WalletConnect_v2 | MetamaskDApp>();
  const { top } = useSafeAreaInsets();

  const { clients, connectedCount } = WalletConnectHub;
  const { dapps } = MetamaskDAppsHub;

  const openApp = (client: WalletConnect_v1 | MetamaskDApp | WalletConnect_v2) => {
    setSelectedClient(client);
    setTimeout(() => open(), 5);
  };

  const renderItem = ({ item }: { item: WalletConnect_v1 | WalletConnect_v2 | MetamaskDApp }) => (
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
      <Text style={{ color: '#3b99fc', fontWeight: '500', marginStart: 8, fontSize: 18 }}>WalletConnect</Text>
    </View>,
    <View
      key="metamask"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <FontAwesome5 name="compass" color={textColor} size={15} />
      <Text style={{ color: textColor, fontWeight: '500', marginStart: 8, fontSize: 18 }}>Web3</Text>
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
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            data={logos}
            renderItem={({ item }) => item}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            style={{ height: headerHeight }}
          />
        </View>

        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', right: 0, bottom: 4, zIndex: 9 }}
          onPress={() => PubSub.publish(MessageKeys.openGlobalQRScanner)}
        >
          <Ionicons name="scan-outline" color={textColor} size={20} />
        </TouchableOpacity>
      </View>

      <Swiper ref={swiper} showsPagination={false} showsButtons={false} loop={false} onIndexChanged={scrollToIndex}>
        <View style={{ width: '100%', height: '100%' }}>
          {dapps.length > 0 && (
            <TouchableOpacity
              onPress={() => swiper.current?.scrollTo(1)}
              style={{
                flexDirection: 'row',
                position: 'absolute',
                right: 16,
                bottom: '5%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={22} color={textColor} style={{ marginHorizontal: 12 }} />
              <FontAwesome5 name="compass" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {connectedCount > 0 ? (
            <FlatList
              data={clients}
              renderItem={renderItem}
              keyExtractor={(i) => i.uniqueId}
              style={{ flex: 1 }}
              bounces={connectedCount > 12}
              contentContainerStyle={{ paddingBottom: 37 }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -32 }}>
              <IllustrationNoData width={150} height={150} />

              <TouchableOpacity
                style={{ alignItems: 'center', flexDirection: 'row', marginTop: 24 }}
                onPress={() => PubSub.publish(MessageKeys.openGlobalQRScanner)}
              >
                <Ionicons name="scan-outline" size={24} color={secondaryTextColor} />
                <Text style={{ color: secondaryFontColor, marginStart: 12 }}>{t('qrscan-tap-to-scan')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <FlatList
          data={dapps}
          renderItem={renderItem}
          style={{ width: '100%', height: '100%' }}
          contentContainerStyle={{ paddingBottom: 37 }}
          keyExtractor={(app) => app.uniqueId}
          bounces={dapps.length >= 12}
        />
      </Swiper>

      <Portal>
        <SquircleModalize ref={ref}>
          {selectedClient && <DApp client={selectedClient} allAccounts={App.allAccounts} close={close} />}
        </SquircleModalize>
      </Portal>
    </View>
  );
});
