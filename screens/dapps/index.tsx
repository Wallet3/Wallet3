import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/App';
import DAppInfo from './DAppInfo';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Image from 'react-native-expo-cached-image';
import { Modalize } from 'react-native-modalize';
import NetworkSelector from '../../modals/dapp/NetworkSelector';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { styles } from '../../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

interface Props {
  client: WalletConnect_v1;
  allAccounts: Account[];
  close: Function;
}

const DApp = observer(({ client, allAccounts, close }: Props) => {
  const swiper = useRef<Swiper>(null);
  const [panel, setPanel] = useState(1);

  const [defaultAccount, setDefaultAccount] = useState(client.activeAccount!);
  const [defaultNetwork, setDefaultNetwork] = useState(client.activeNetwork);

  const disconnect = () => {
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
    setDefaultAccount(client.activeAccount!);
  };

  const swipeTo = (index: number) => {
    setPanel(index);
    setTimeout(() => swiper.current?.scrollTo(1), 0);
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
          <AccountSelector single accounts={allAccounts} selectedAccounts={client.accounts} onDone={selectAccounts} />
        ) : undefined}
      </Swiper>
    </SafeAreaProvider>
  );
});

const DAppItem = observer(({ item, openApp }: { item: WalletConnect_v1; openApp: (item: WalletConnect_v1) => void }) => {
  const { appMeta } = item;
  const { t } = i18n;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }} onPress={() => openApp(item)}>
        <View style={{ marginEnd: 12, borderWidth: 1, borderRadius: 5, borderColor, padding: 2 }}>
          <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 27, height: 27 }} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '500', fontSize: 17 }} numberOfLines={1}>
            {appMeta?.name || appMeta?.url}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.isMobileApp ? (
              <Ionicons name="ios-phone-portrait-outline" size={9} style={{ marginTop: 4, marginEnd: 3 }} />
            ) : undefined}

            <Text style={{ color: secondaryFontColor, fontSize: 12, marginTop: 4 }}>
              {`${t('connectedapps-list-last-used')}: ${new Date(item.lastUsedTimestamp).toLocaleDateString()}`}
            </Text>

            <ScrollView
              horizontal
              style={{ marginBottom: -4, marginStart: 4 }}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              {generateNetworkIcon({
                color: item.activeNetwork.color,
                chainId: Number(item.lastUsedChainId),
                width: 12,
                height: 12,
                style: { marginHorizontal: 4 },
              })}
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 12, marginEnd: -12 }} onPress={() => item.killSession()}>
        <FontAwesome name="trash-o" size={19} />
      </TouchableOpacity>
    </View>
  );
});

export default observer(({ navigation }: DrawerScreenProps<{}, never>) => {
  const { t } = i18n;
  const [selectedClient, setSelectedClient] = useState<WalletConnect_v1>();
  const { ref, open, close } = useModalize();

  const { sortedClients, connectedCount } = WalletConnectV1ClientHub;

  const openApp = (client: WalletConnect_v1) => {
    setSelectedClient(client);
    setTimeout(() => open(), 0);
  };

  const renderItem = ({ item }: { item: WalletConnect_v1 }) => <DAppItem item={item} openApp={openApp} />;

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
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
            <MaterialCommunityIcons name="qrcode-scan" size={32} color={secondaryFontColor} />
          </TouchableOpacity>
          <Text style={{ color: secondaryFontColor, marginTop: 24 }}>{t('connectedapps-noapps')}</Text>
        </View>
      )}

      <Portal>
        <Modalize adjustToContentHeight ref={ref} disableScrollIfPossible modalStyle={styles.modalStyle}>
          {selectedClient ? <DApp client={selectedClient} allAccounts={App.allAccounts} close={close} /> : undefined}
        </Modalize>
      </Portal>
    </View>
  );
});
