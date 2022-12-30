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
  containerStyle?: StyleProp<ViewStyle>;
  onDangerous?: () => void;
}

export default ({ chainId, address, containerStyle, onDangerous }: Props) => {
  const [publicName, setPublicName] = useState('');
  const [dangerous, setDangerous] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfo(chainId, address).then(({ dangerous, publicName }) => {
      setPublicName(publicName);
      setDangerous(dangerous);
      setLoading(false);

      dangerous ? onDangerous?.() : undefined;
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
      {!dangerous && publicName && <Ionicons name="checkmark-circle" color={color} size={9} style={{ marginStart: 4 }} />}
    </Animatable.View>
  );

  return loading ? <Skeleton style={{ height: 9, width: 72, ...(containerStyle || ({} as any)) }} /> : <Indicator />;
};
