import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { INetwork } from '../../common/Networks';
import { getUrls } from '../../common/RPC';
import { Button, SafeViewContainer } from '../../components';
import i18n from '../../i18n';
import Theme from '../../viewmodels/settings/Theme';
import styles from '../styles';

export default ({ network, onDone }: { network?: INetwork; onDone: (network: INetwork) => void }) => {
  if (!network) return null;

  const [symbol, setSymbol] = useState(network.symbol);
  const [explorer, setExplorer] = useState(network.explorer);
  const [rpc, setRpc] = useState(
    network.rpcUrls?.join(', ') ||
      getUrls(network.chainId).filter((url) => !(url.includes('infura.io') || url.includes('alchemyapi.io')))[0]
  );

  const { t } = i18n;
  const { textColor, borderColor } = Theme;

  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={reviewItemsContainer}>
        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-network')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ ...network, width: 15, style: { marginEnd: 8 } })}
            <Text style={{ ...reviewItemValueStyle, maxWidth: 180, color: network.color }} numberOfLines={1}>
              {network.network}
            </Text>
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-chainid')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {Number(network.chainId)}
          </Text>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-currency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              selectTextOnFocus
              editable={network.isUserAdded}
              style={{ ...reviewItemValueStyle, maxWidth: 180 }}
              numberOfLines={1}
              defaultValue={symbol}
              onChangeText={setSymbol}
            />
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>RPC URL</Text>
          <TextInput
            selectTextOnFocus
            editable={network.isUserAdded}
            style={{ ...reviewItemValueStyle, maxWidth: '70%' }}
            numberOfLines={1}
            onChangeText={setRpc}
            defaultValue={rpc}
          />
        </View>

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-explorer')}</Text>
          <TextInput
            selectTextOnFocus
            editable={network.isUserAdded}
            style={{ ...reviewItemValueStyle, maxWidth: '70%' }}
            numberOfLines={1}
            defaultValue={explorer}
            onChangeText={setExplorer}
          />
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Button
        themeColor={network.color}
        title="OK"
        txtStyle={{ textTransform: 'uppercase' }}
        onPress={() => onDone({ ...network, symbol, rpcUrls: rpc.split(',').map((url) => url.trim()), explorer })}
      />
    </SafeViewContainer>
  );
};
