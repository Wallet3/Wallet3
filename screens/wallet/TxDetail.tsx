import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../components';
import { Gwei_1 } from '../../common/Constants';
import Networks from '../../viewmodels/core/Networks';
import Transaction from '../../models/entities/Transaction';
import { TxController } from '../../viewmodels/misc/TxController';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openInappBrowser } from '../../modals/app/InappBrowser';
import { thirdFontColor } from '../../constants/styles';
import { utils } from 'ethers';

export default observer(({ tx, close }: { tx?: Transaction; close?: Function }) => {
  const { t } = i18n;
  const [network] = useState(Networks.find(tx?.chainId || 1) || Networks.current);

  const speedUp = (cancelTx?: boolean) => {
    if (!tx) return;

    const vm = new TxController(tx);
    cancelTx ? vm.cancel() : vm.speedUp();

    close?.();
  };

  return (
    <View style={{ padding: 16, paddingTop: 20, paddingBottom: 32 }}>
      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-network')}:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'flex-end' }}>
          {generateNetworkIcon({
            ...network,
            width: 16,
            height: 16,
            style: { marginEnd: 7 },
          })}
          <Text style={{ ...styles.txt, maxWidth: 160 }} numberOfLines={1}>
            {network.network}
          </Text>
        </View>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-tx-hash')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx?.hash ?? '', 10, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-from')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx?.from ?? '', 9, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-to')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx?.readableInfo?.recipient ?? tx?.to!, 9, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-value')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {`${utils.formatEther(tx?.value ?? '0')} ${network.symbol}`}
        </Text>
      </View>

      {Number(tx?.readableInfo?.amount) > 0 && (
        <View style={styles.itemContainer}>
          <Text style={styles.txt}>{t('modal-tx-details-token')}:</Text>
          <Text style={styles.txt} numberOfLines={1}>
            {`${tx?.readableInfo?.amount} ${tx?.readableInfo?.symbol ?? tx?.readableInfo?.nft}`}
          </Text>
        </View>
      )}

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-gas-limit')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx?.gas}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-gas-price')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>{`${Number(`${tx?.gasPrice?.toString() || 0}`) / Gwei_1} Gwei`}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-nonce')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx?.nonce}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-type')}:</Text>
        <Text style={styles.txt}>{tx?.priorityPrice ? '2 (EIP-1559)' : '0 (Legacy)'}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-status')}:</Text>
        <Text style={styles.txt}>
          {t(
            `modal-tx-details-status-${Number.isInteger(tx?.blockNumber) ? (tx?.status ? 'confirmed' : 'failed') : 'pending'}`
          )}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-block-height')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {tx?.blockNumber}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>{t('modal-tx-details-timestamp')}:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {new Date(tx?.timestamp || 0).toLocaleString()}
        </Text>
      </View>

      <View style={{ ...styles.itemContainer, flexDirection: 'column' }}>
        <Text style={styles.txt}>{t('modal-tx-details-data')}:</Text>
        <Text style={{ ...styles.txt, maxWidth: '100%' }} numberOfLines={5}>
          {tx?.readableInfo?.decodedFunc ? `${tx.readableInfo.decodedFunc}\n\n` : undefined}
          {tx?.data}
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
        <TouchableOpacity onPressIn={() => openInappBrowser(`${network.explorer}/tx/${tx?.hash}`, 'wallet')}>
          <Text style={{ fontSize: 12, color: network.color }}>{t('modal-tx-details-view-on-explorer')}</Text>
        </TouchableOpacity>
      </View>

      {tx?.blockNumber && tx.blockNumber >= 0 ? undefined : (
        <View style={{ flexDirection: 'row' }}>
          <Button
            title={t('button-cancel-tx')}
            reverse
            themeColor={network.color}
            style={{ flex: 1 }}
            onPress={() => speedUp(true)}
          />
          <View style={{ width: 12 }} />
          <Button title={t('button-speed-up')} themeColor={network.color} style={{ flex: 1 }} onPress={() => speedUp()} />
        </View>
      )}
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
