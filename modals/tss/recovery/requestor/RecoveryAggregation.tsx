import { FadeInDownView, FadeInRightView } from '../../../../components/animations';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';

import Aggregation from '../../aggregator/Aggregation';
import DeviceInfo from '../../components/DeviceInfo';
import { Ionicons } from '@expo/vector-icons';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import { ReactiveScreen } from '../../../../utils/device';
import { TCPClient } from '../../../../common/p2p/TCPClient';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../../../utils/animations';
import { verifiedColor } from '../../../../constants/styles';

export default observer(({ vm }: { vm: KeyRecoveryRequestor }) => {
  const { t } = i18n;
  const { pendingClients, pendingCount } = vm;
  const { secondaryTextColor, textColor } = Theme;

  useEffect(() => startLayoutAnimation(), [pendingCount]);

  const renderItem = ({ item }: { item: TCPClient }) => {
    return (
      <FadeInRightView
        style={{ flex: 1, width: ReactiveScreen.width - 12 - 24 - 24, height: 64, flexDirection: 'row', alignItems: 'center' }}
      >
        <DeviceInfo info={item.remoteInfo!} />
        <View style={{ alignItems: 'flex-end', marginHorizontal: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: secondaryTextColor, marginBottom: 2, marginTop: 5 }}>
            Pairing Code
          </Text>
          <Text style={{ fontSize: 27, color: verifiedColor, fontWeight: '800' }}>{item.pairingCode}</Text>
        </View>
      </FadeInRightView>
    );
  };

  console.log('pending recovery:', pendingCount);

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <Aggregation vm={vm} buttonTitle={t('button-cancel')} buttonDisabled hideButton />

      {pendingCount > 0 && (
        <FadeInRightView style={{ height: 72, flexDirection: 'row', alignItems: 'center' }}>
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
        </FadeInRightView>
      )}
    </FadeInDownView>
  );
});
