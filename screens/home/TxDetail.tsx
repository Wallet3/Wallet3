import { StyleSheet, Text, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/Transaction';

import { ChainIdToNetwork } from '../../common/Networks';
import { Gwei_1 } from '../../common/Constants';
import React from 'react';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

export default observer(({ tx }: { tx?: Transaction }) => {
  if (!tx) return null;

  const network = ChainIdToNetwork.get(tx.chainId ?? 1)!;

  return (
    <View style={{ padding: 16, paddingTop: 24, paddingBottom: 32 }}>
      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Network:</Text>
        <Text style={styles.txt}>{network.network}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Tx Hash:</Text>
        <Text style={styles.txt} numberOfLines={1}>
          {formatAddress(tx.hash!, 10, 7)}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>From:</Text>
        <Text style={styles.txt}>{formatAddress(tx.from!, 10, 7)}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>To:</Text>
        <Text style={styles.txt}>{formatAddress(tx.readableInfo?.recipient ?? tx.to!, 10, 7)}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Value:</Text>
        <Text style={styles.txt}>
          {`${tx.readableInfo?.amount ?? utils.formatEther(tx.value ?? '0')} ${tx.readableInfo?.symbol ?? network.symbol}`}
        </Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Gas Limit:</Text>
        <Text style={styles.txt}>{tx.gas}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Gas Price:</Text>
        <Text style={styles.txt}>{`${Number(`${tx.gasPrice?.toString() || 0}`) / Gwei_1} Gwei`}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Nonce:</Text>
        <Text style={styles.txt}>{tx.nonce}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Type:</Text>
        <Text style={styles.txt}>{tx.priorityPrice ? `2 (EIP 1559)` : `0 (Legacy)`}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Status:</Text>
        <Text style={styles.txt}>{Number.isInteger(tx.blockNumber) ? (tx.status ? 'Confirmed' : 'Failed') : 'Pending'}</Text>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.txt}>Block Height:</Text>
        <Text style={styles.txt}>{tx.blockNumber}</Text>
      </View>

      <View style={{ ...styles.itemContainer, flexDirection: 'column' }}>
        <Text style={styles.txt}>Data:</Text>
        <Text style={{ ...styles.txt, maxWidth: '100%' }} numberOfLines={5}>
          {tx.data}
        </Text>
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
    color: '#75869c',
    maxWidth: '50%',
  },
});
