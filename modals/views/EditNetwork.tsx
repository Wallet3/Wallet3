import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';

import { INetwork } from '../../common/Networks';
import Networks from '../../viewmodels/Networks';
import Theme from '../../viewmodels/settings/Theme';
import TxException from '../components/TxException';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { getRPCUrls } from '../../common/RPC';
import i18n from '../../i18n';
import { startLayoutAnimation } from '../../utils/animations';
import styles from '../styles';

export default ({ network, onDone }: { network?: INetwork; onDone: (network?: INetwork) => void }) => {
  if (!network) return null;

  const [symbol, setSymbol] = useState('');
  const [explorer, setExplorer] = useState('');
  const [rpc, setRpc] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [exception, setException] = useState('');

  useEffect(() => {
    if (!network) return;

    setName(network.network);
    setSymbol(network.symbol);
    setExplorer(network.explorer);
    setColor(network.color);
    setRpc(
      network.rpcUrls?.join(', ') ||
        getRPCUrls(network.chainId)
          .filter((i) => !(i.includes('infura.io') || i.includes('alchemyapi.io')))
          .join(', ') ||
        ''
    );
  }, [network]);

  const { t } = i18n;
  const { textColor, borderColor } = Theme;

  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemValueStyle: any = {
    ...styles.reviewItemValue,
    color: textColor,
    textAlign: 'right',
    maxWidth: '70%',
    minWidth: 128,
  };

  const editable = network.isUserAdded ? true : false;

  return (
    <SafeViewContainer style={styles.container}>
      <View style={reviewItemsContainer}>
        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-network')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ ...network, width: 17, height: 17, hideEVMTitle: true, style: { marginEnd: 8 } })}
            <TextInput
              editable={editable}
              style={{ ...styles.reviewItemValue, color: color || network.color }}
              numberOfLines={1}
              defaultValue={name}
              onChangeText={setName}
              autoCorrect={false}
            />

            {busy && <ActivityIndicator animating style={{ marginStart: 8 }} size={'small'} color={network.color} />}
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-chainid')}</Text>
          <Text style={reviewItemValueStyle} numberOfLines={1}>
            {Number(network.chainId)}
          </Text>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-currency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              selectTextOnFocus
              editable={editable}
              style={reviewItemValueStyle}
              numberOfLines={1}
              defaultValue={symbol}
              onChangeText={setSymbol}
              autoCorrect={false}
            />
          </View>
        </View>

        {network.isUserAdded && (
          <View style={reviewItemStyle}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-color')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                editable={editable}
                style={reviewItemValueStyle}
                numberOfLines={1}
                defaultValue={color}
                maxLength={7}
                onChangeText={(txt) => setColor(txt.substring(0, 7).toUpperCase())}
                autoCorrect={false}
              />
            </View>
          </View>
        )}

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>RPC URLs</Text>
          <TextInput
            editable={true}
            style={reviewItemValueStyle}
            numberOfLines={1}
            onChangeText={setRpc}
            defaultValue={rpc}
            autoCorrect={false}
          />
        </View>

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle} numberOfLines={1}>
            {t('modal-dapp-add-new-network-explorer')}
          </Text>
          <TextInput
            selectTextOnFocus
            editable={editable}
            style={reviewItemValueStyle}
            numberOfLines={1}
            onChangeText={setExplorer}
            autoCorrect={false}
          >
            {explorer}
          </TextInput>
        </View>
      </View>

      {exception ? <TxException exception={exception} /> : undefined}

      <View style={{ flex: 1 }} />

      <Button
        themeColor={color || network.color}
        disabled={(!rpc && network.isUserAdded) || !symbol || !explorer || !name || busy}
        title="OK"
        txtStyle={{ textTransform: 'uppercase' }}
        onPress={async () => {
          let rpcUrls = rpc
            .split(',')
            .map((url) => url.trim().split(/\s/))
            .flat()
            .map((i) => i.trim())
            .filter((i) => i.toLowerCase().startsWith('http'));

          const builtinRPCs = getRPCUrls(network.chainId);

          if (
            symbol.toLowerCase() === network.symbol.toLowerCase() &&
            explorer.toLowerCase() === network.explorer.toLowerCase() &&
            name.toLowerCase() === network.network.toLowerCase() &&
            color.toLowerCase() === network.color.toLowerCase() &&
            (rpcUrls.length > 0 ? rpcUrls.every((url) => (network.rpcUrls || builtinRPCs).includes(url)) : true)
          ) {
            setException('');
            onDone();
            return;
          }

          startLayoutAnimation();
          setBusy(true);
          setException('');

          const newUrls = rpcUrls.filter((i) => !builtinRPCs.includes(i));

          if (newUrls.length === 0) {
            setException('');
            onDone();
            setBusy(false);
            return;
          }

          const match = await Promise.all(newUrls.map((url) => Networks.testRPC(url, network.chainId)));

          setBusy(false);

          const checkedUrls = match.map((v, i) => (v ? rpcUrls[i] : null)).filter((i) => i) as string[];

          if (checkedUrls.length === 0) {
            setException(`RPC chainId does not match current network id`);
            return;
          }

          onDone({
            ...network,
            network: name.trim(),
            symbol: symbol.toUpperCase().trim(),
            color,
            explorer: explorer.trim(),
            rpcUrls: checkedUrls,
          });
        }}
      />
    </SafeViewContainer>
  );
};
