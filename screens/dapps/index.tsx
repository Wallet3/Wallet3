import { Entypo, FontAwesome } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { secondaryFontColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/Account';
import App from '../../viewmodels/App';
import DAppHub from '../../viewmodels/DAppHub';
import Image from 'react-native-expo-cached-image';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import { PublicNetworks } from '../../common/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeViewContainer } from '../../components';
import Swiper from 'react-native-swiper';
import { WCClientMeta } from '../../models/WCSession_v1';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { observer } from 'mobx-react-lite';
import { styles } from '../../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DAppInfo = ({ client, accounts }: { client: WalletConnect_v1; accounts: Account[] }) => {
  const { appMeta } = client || {};

  const defaultAccount = accounts.find((a) => a.address === client.accounts[0]);
  const defaultNetwork = client.findTargetNetwork({ networks: PublicNetworks, defaultNetwork: Networks.current });

  return (
    <SafeAreaProvider style={{}}>
      <SafeViewContainer>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, color: thirdFontColor }}>DApp Info</Text>
        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>DApp:</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 17, height: 17, marginEnd: 4 }} />
            <Text style={viewStyles.itemTxt} numberOfLines={1}>
              {appMeta?.name}
            </Text>
          </View>
        </View>
        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>Description:</Text>
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {appMeta?.description || 'No Description'}
          </Text>
        </View>
        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>URL:</Text>
          <TouchableOpacity>
            <Text style={viewStyles.itemTxt} numberOfLines={1}>
              {appMeta?.url}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>Last used:</Text>
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {client.lastUsedTimestamp.toLocaleString(undefined, {})}
          </Text>
        </View>

        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>Accounts:</Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            {defaultAccount?.avatar ? (
              <Image
                source={{ uri: defaultAccount.avatar }}
                style={{ width: 15, height: 15, borderRadius: 100, marginEnd: 4 }}
              />
            ) : undefined}
            <Text style={viewStyles.itemTxt} numberOfLines={1}>
              {defaultAccount?.ensName || formatAddress(defaultAccount?.address ?? '', 7, 5)}
            </Text>
            <Entypo name="chevron-right" style={viewStyles.arrow} />
          </TouchableOpacity>
        </View>

        <View style={viewStyles.infoItem}>
          <Text style={viewStyles.itemTxt}>Networks:</Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ chainId: defaultNetwork.chainId, width: 15, height: 15, style: { marginHorizontal: 4 } })}
            <Text style={viewStyles.itemTxt} numberOfLines={1}>
              {defaultNetwork.network}
            </Text>

            <Entypo name="chevron-right" style={viewStyles.arrow} />
          </TouchableOpacity>
        </View>
      </SafeViewContainer>
    </SafeAreaProvider>
  );
};

const DApp = observer(({ client, allAccounts }: { client: WalletConnect_v1; allAccounts: Account[] }) => {
  const swiper = useRef<Swiper>(null);

  return (
    <View style={{ flex: 1, height: 429 }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <DAppInfo client={client} accounts={allAccounts} />
      </Swiper>
    </View>
  );
});

export default observer(() => {
  const [selectedClient, setSelectedClient] = useState<WalletConnect_v1>();
  const { ref, open, close } = useModalize();

  const { clients } = DAppHub;

  const openApp = (client: WalletConnect_v1) => {
    setSelectedClient(client);
    open();
  };

  const renderItem = ({ item }: { item: WalletConnect_v1 }) => {
    const { appMeta } = item;

    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }} onPress={() => openApp(item)}>
          <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 27, height: 27, marginEnd: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 17 }} numberOfLines={1}>
              {appMeta?.name}
            </Text>
            <Text style={{ color: secondaryFontColor, fontSize: 12, marginTop: 4 }}>
              {`Last used: ${item.lastUsedTimestamp.toLocaleDateString(undefined, {})}`}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 12, marginEnd: -12 }} onPress={() => item.killSession()}>
          <FontAwesome name="trash-o" size={19} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <FlatList data={clients} renderItem={renderItem} keyExtractor={(i) => i.peerId} style={{ flex: 1 }} />

      <Portal>
        <Modalize adjustToContentHeight ref={ref} disableScrollIfPossible modalStyle={styles.modalStyle}>
          {selectedClient ? <DApp client={selectedClient} allAccounts={App.allAccounts} /> : undefined}
        </Modalize>
      </Portal>
    </View>
  );
});

const viewStyles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderBottomColor: '#75869c10',
  },

  itemTxt: {
    color: thirdFontColor,
    fontSize: 15,
    maxWidth: 200,
  },

  arrow: { color: thirdFontColor, marginStart: 4, opacity: 0.5 },
});
