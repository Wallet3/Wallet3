import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import Aggregation from '../../aggregator/Aggregation';
import DeviceInfo from '../../components/DeviceInfo';
import { FadeInDownView } from '../../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import React from 'react';
import { ReactiveScreen } from '../../../../utils/device';
import { TCPClient } from '../../../../common/p2p/TCPClient';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { verifiedColor } from '../../../../constants/styles';

export default observer(({ vm }: { vm: KeyRecoveryRequestor }) => {
  const { t } = i18n;
  const { pendingClients, pendingCount } = vm;
  const { secondaryTextColor, textColor } = Theme;

  const renderItem = ({ item }: { item: TCPClient }) => {
    return (
      <View
        style={{ flex: 1, width: ReactiveScreen.width - 12 - 24 - 24, height: 64, flexDirection: 'row', alignItems: 'center' }}
      >
        <DeviceInfo info={item.remoteInfo!} />
        <View style={{ marginTop: 4, alignItems: 'flex-end', marginEnd: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: secondaryTextColor, marginBottom: 3 }}>Pairing Code</Text>
          <Text style={{ fontSize: 25, color: verifiedColor, fontWeight: '800' }}>{item.pairingCode}</Text>
        </View>
      </View>
    );
  };

  console.log('pending recovery:', pendingCount);

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <Aggregation vm={vm} buttonTitle={t('button-cancel')} buttonDisabled hideButton />

      <View style={{ height: 72, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ paddingHorizontal: 6 }}>
          <Ionicons name="chevron-back" />
        </TouchableOpacity>

        <FlatList
          style={{}}
          contentContainerStyle={{ flexGrow: 1 }}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          data={pendingClients}
          renderItem={renderItem}
          keyExtractor={(i) => i.remoteIP}
        />

        <TouchableOpacity style={{ paddingHorizontal: 6 }}>
          <Ionicons name="chevron-forward" />
        </TouchableOpacity>
      </View>
    </FadeInDownView>
  );
});
