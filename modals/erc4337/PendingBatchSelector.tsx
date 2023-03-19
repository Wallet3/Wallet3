import { AccountBase, SendTxRequest } from '../../viewmodels/account/AccountBase';
import { BatchRequest, ERC4337Queue } from '../../viewmodels/transferring/ERC4337Queue';
import { Placeholder, SafeViewContainer } from '../../components';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';

import AccountIndicator from '../components/AccountIndicator';
import Avatar from '../../components/Avatar';
import { FlatList } from 'react-native-gesture-handler';
import { INetwork } from '../../common/Networks';
import { MaterialIcons } from '@expo/vector-icons';
import Networks from '../../viewmodels/core/Networks';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import styles from '../styles';

interface Props {
  vm: ERC4337Queue;
  onBatchSelected: (args: BatchRequest) => void;
}

export default ({ vm, onBatchSelected }: Props) => {
  const { chainQueue } = vm;
  const { borderColor, secondaryTextColor } = Theme;

  const renderItem = ({ item }: { item: { network: INetwork; account: AccountBase; requests: Partial<SendTxRequest>[] } }) => {
    const { account, requests } = item;

    return (
      <TouchableOpacity
        onPress={() => onBatchSelected(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 16,
          padding: 8,
          borderColor,
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          overflow: 'hidden',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AccountIndicator account={account} txtStyle={{ fontSize: 17, maxWidth: undefined }} />
        </View>
        <Placeholder />
        <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '600' }}>{requests.length}</Text>
        <MaterialIcons name="keyboard-arrow-right" size={15} color={secondaryTextColor} style={{ marginBottom: -1 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={[styles.container]}>
      <SectionList
        sections={chainQueue}
        bounces={false}
        keyExtractor={(c) => `${c.network.chainId}_${c.account}_${c.requests.length}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 22,
              paddingVertical: 8,
              paddingBottom: 10,
              gap: 5,
            }}
          >
            {generateNetworkIcon({ ...section.network, width: 11 })}
            <Text style={{ fontSize: 12, fontWeight: '600', color: section.network.color }}>{section.network.network}</Text>
            <Placeholder />
            {section.index === 0 && <Text style={{ color: secondaryTextColor, fontSize: 12 }}>Pending Txs</Text>}
          </View>
        )}
        style={{ margin: -16, marginBottom: -36 }}
        contentContainerStyle={{ paddingBottom: 36, paddingTop: 16 }}
      />
    </SafeViewContainer>
  );
};
