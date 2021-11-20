import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { themeColor, thirdFontColor } from '../../constants/styles';

import App from '../../App';
import Image from 'react-native-expo-cached-image';
import { Networks } from '../../common/Networks';
import React from 'react';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { observer } from 'mobx-react-lite';

interface DAppProps {
  client: WalletConnect_v1;
  onNetworksPress?: () => void;
  onAccountsPress?: () => void;
  close: Function;
  onConnect: () => void;
}

export default observer(({ client, onNetworksPress, onAccountsPress, close, onConnect }: DAppProps) => {
  const networks = Networks.filter((n) => client.enabledChains.includes(n.chainId));
  const [network] = networks;
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
          <Text style={{ color: 'crimson', fontSize: 24 }}>Not Supported Network</Text>
        </View>
        <Button title="Close" onPress={() => close()} />
      </View>
    );
  }

  return (
    <SafeViewContainer style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <TouchableOpacity style={{ paddingVertical: 6 }} onPress={onAccountsPress}>
          <Text style={{ color: thirdFontColor }}>{formatAddress(client.accounts[0], 6, 5)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNetworksPress}
          disabled={client.version > 1}
          style={{
            padding: 6,
            paddingHorizontal: 12,
            borderColor: `${network.color}90`,
            borderWidth: 1,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({ chainId: network.chainId, width: 16, height: 16 })}
          <Text style={{ color: network.color, marginStart: 6 }}>{`${network.network}`}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Image source={{ uri: app.icons[0] }} style={{ width: 72, height: 72, marginBottom: 12 }} />

      <Text style={{ ...viewStyles.txt, fontSize: 24, fontWeight: '500', opacity: 1 }}>{app.name}</Text>

      <Text style={viewStyles.txt} numberOfLines={1}>
        {app.url}
      </Text>

      {app.description ? (
        <Text style={viewStyles.txt} numberOfLines={2}>
          {app.description}
        </Text>
      ) : undefined}

      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <Button title="Connect" onPress={onConnect} />
        <Button title="Reject" themeColor={themeColor} onPress={reject} style={{ marginTop: 12 }} reverse />
      </View>
    </SafeViewContainer>
  );
});

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    opacity: 0.75,
    fontSize: 17,
    maxWidth: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
});
