import { Linking, StyleSheet, Text, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/Transaction';

import { ChainIdToNetwork } from '../../common/Networks';
import { Gwei_1 } from '../../common/Constants';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { thirdFontColor } from '../../constants/styles';
import { utils } from 'ethers';

export default observer(({ tx }: { tx?: Transaction }) => {
  if (!tx) return null;

  const { t } = i18n;
  const network = ChainIdToNetwork.get(tx.chainId ?? 1)!;

  return (
    <View style={{ padding: 16, paddingTop: 24, paddingBottom: 32 }}>
      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-network')}:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'flex-end' }}>
          {generateNetworkIcon({
            color: network.color,
            chainId: network.chainId,
            width: 16,
            height: 16,
            style: { marginEnd: 4 },
          })}
          <Text style={styles.txt}>{network.network}</Text>
        </View>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-tx-hash')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx.hash!, 10, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-from')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx.from!, 9, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-to')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx.readableInfo?.recipient ?? tx.to!, 9, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-value')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {`${tx.readableInfo?.amount ?? utils.formatEther(tx.value ?? '0')} ${tx.readableInfo?.symbol ?? network.symbol}`}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-gas-limit')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx.gas}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-gas-price')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>{`${Number(`${tx.gasPrice?.toString() || 0}`) / Gwei_1} Gwei`}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-nonce')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx.nonce}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-type')}:</Text>
        <Text style={styles.txt}>{tx.priorityPrice ? `2 (EIP-1559)` : `0 (Legacy)`}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-status')}:</Text>
        <Text style={styles.txt}>
          {t(`modal-tx-details-status-${Number.isInteger(tx.blockNumber) ? (tx.status ? 'confirmed' : 'failed') : 'pending'}`)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-block-height')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx.blockNumber}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-timestamp')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {new Date(tx.timestamp).toLocaleString()}
        </Text>
      </View>

      <View style={{ ...styles.itemContainer, flexDirection: 'column' }}>
        <Text style={styles.txt}>{t('modal-tx-details-data')}:</Text>
        <Text style={{ ...styles.txt, maxWidth: '100%' }} numberOfLines={5}>
          {tx.data}
        </Text>
      </View>

      <View
        style={{
          ...styles.itemContainer,
          justifyContent: 'flex-end',
          borderBottomWidth: 0,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity onPressIn={() => Linking.openURL(`${network.explorer}/tx/${tx.hash}`)}>
          <Text style={{ fontSize: 12, color: network.color }}>{t('modal-tx-details-view-on-explorer')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderBottomColor: '#75869c10',
  },

  txt: {
    fontSize: 15,
    color: thirdFontColor,
    maxWidth: '60%',
  },
});
