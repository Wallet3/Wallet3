import BackButton from '../components/BackButton';
import React from 'react';
import Scanner from '../../components/Scanner';
import { View } from 'react-native';

interface Props {
  onBack?: () => void;
  enabled?: boolean;
}
export default ({ onBack, enabled }: Props) => {
  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
      {enabled ? <Scanner style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }} /> : undefined}

      <View style={{ padding: 16 }}>
        <BackButton onPress={onBack} color={'#fff'} />
      </View>
    </View>
  );
};
