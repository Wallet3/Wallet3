import { Button, SafeViewContainer } from '../../components';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import { Feather } from '@expo/vector-icons';
import { INetwork } from '../../common/Networks';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  networks: INetwork[];
  selectedChains: number[];
  onDone: (selectedChains: number[]) => void;
  single?: boolean;
}

export default observer(({ networks, selectedChains, onDone, single }: Props) => {
  const [selected, setSelected] = useState<number[]>(selectedChains);
  const defaultNetwork = networks.find((n) => n.chainId === (selectedChains[0] || 1));
  const { t } = i18n;
  const { borderColor } = Theme;

  const toggleNetwork = (network: INetwork) => {
    if (single) {
      setSelected([network.chainId]);
      onDone([network.chainId]);
      return;
    }

    if (selected.includes(network.chainId)) {
      if (selected.length === 1) return;
      setSelected(selected.filter((id) => id !== network.chainId));
    } else {
      setSelected([...selected, network.chainId]);
    }
  };

  const renderItem = ({ item }: { item: INetwork }) => {
    return (
      <TouchableOpacity
        onPress={() => toggleNetwork(item)}
        style={{
          flexDirection: 'row',
          padding: 4,
          alignItems: 'center',
          paddingVertical: 12,
          flex: 1,
        }}
      >
        <Feather name="check" color={item.color} size={15} style={{ opacity: selected.includes(item.chainId) ? 1 : 0 }} />
        {generateNetworkIcon({
          ...item,
          width: 23,
          height: 23,
          style: { marginHorizontal: 10, marginStart: item.chainId === 1 ? 9 : undefined },
        })}

        <Text style={{ color: item.color, fontSize: 16, fontWeight: '500', maxWidth: '80%' }} numberOfLines={1}>
          {item.network}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View style={{ borderBottomColor: borderColor, borderBottomWidth: 1, paddingBottom: 2 }}>
        <Text style={{ color: secondaryFontColor }}>{t('modal-networks-selector-title')}:</Text>
      </View>

      <FlatList
        data={networks}
        renderItem={renderItem}
        keyExtractor={(i) => i.network}
        contentContainerStyle={{ paddingBottom: 8 }}
        style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 12 }}
      />

      <Button
        title={t('button-done')}
        disabled={selected.length === 0}
        onPress={() => onDone(selected)}
        themeColor={defaultNetwork?.color}
      />
    </SafeViewContainer>
  );
});
