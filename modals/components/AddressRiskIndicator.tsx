import * as Animatable from 'react-native-animatable';

import React, { useEffect, useState } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { secureColor, warningColor } from '../../constants/styles';

import { BreathAnimation } from '../../utils/animations';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '../../components';
import { fetchInfo } from '../../viewmodels/services/EtherscanPublicTag';

interface Props {
  address: string;
  chainId: number;
  label?: string;
  risky?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  onAddressChecked?: (dangerous: boolean) => void;
}

export default ({ chainId, address, containerStyle, onAddressChecked, risky, label }: Props) => {
  const [publicName, setPublicName] = useState(label ?? '');
  const [dangerous, setDangerous] = useState(risky ?? false);
  const [loading, setLoading] = useState(!label && onAddressChecked ? true : false);

  useEffect(() => {
    if (label || !onAddressChecked) return;

    fetchInfo(chainId, address).then((item) => {
      if (!item) return;

      const { dangerous, publicName } = item;
      setPublicName(publicName || '');
      setDangerous(dangerous);
      setLoading(false);
      onAddressChecked?.(dangerous);
    });
  }, [chainId, address]);

  const color = dangerous ? warningColor : secureColor;

  const Indicator = () => (
    <Animatable.View
      animation={dangerous ? BreathAnimation : undefined}
      iterationCount="infinite"
      useNativeDriver
      duration={1250}
      style={{ flexDirection: 'row', alignItems: 'center', ...(containerStyle || ({} as any)) }}
    >
      {dangerous && <Ionicons name="warning" color={color} size={9} style={{ marginEnd: 4 }} />}
      <Text style={{ fontSize: 9, color, fontWeight: '600' }} numberOfLines={1}>
        {publicName}
      </Text>
      {!dangerous && <Ionicons name="checkmark-circle" color={color} size={9} style={{ marginStart: 4 }} />}
    </Animatable.View>
  );

  return loading ? (
    <Skeleton style={{ height: 9, width: 72, ...(containerStyle || ({} as any)) }} />
  ) : publicName ? (
    <Indicator />
  ) : null;
};
