import { FlatList, TouchableOpacity, View } from 'react-native';

import Aggregation from '../../aggregator/Aggregation';
import DeviceInfo from '../../components/DeviceInfo';
import { FadeInDownView } from '../../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import React from 'react';
import { TCPClient } from '../../../../common/p2p/TCPClient';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ vm }: { vm: KeyRecoveryRequestor }) => {
  const { t } = i18n;
  const { pendingClients } = vm;

  const renderItem = ({ item }: { item: TCPClient }) => {
    return (
      <View>
        <DeviceInfo info={item.remoteInfo!} />
      </View>
    );
  };

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <Aggregation vm={vm} buttonTitle={t('button-cancel')} buttonDisabled hideButton />

      <View style={{ height: 72, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ paddingHorizontal: 6 }}>
          <Ionicons name="chevron-back" />
        </TouchableOpacity>

        <FlatList
          style={{ flex: 1 }}
          pagingEnabled
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
