import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { WCCallRequestRequest } from '../../models/WCSession_v1';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  msg: string;
  themeColor: string;
  onReject?: () => void;
  onSign?: () => void;
}

export default observer(({ msg, themeColor, onReject, onSign }: Props) => {
  return (
    <SafeViewContainer>
      <Text style={{ fontSize: 24, color: themeColor, fontWeight: '500', marginBottom: 12 }}>Sign</Text>

      <ScrollView style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }} alwaysBounceVertical={false}>
        <Text>{msg}</Text>
      </ScrollView>

      <View style={{ flexDirection: 'row' }}>
        <Button title="Cancel" onPress={onReject} reverse themeColor={themeColor} style={{ flex: 10 }} />
        <View style={{ width: 12 }} />
        <Button title="Sign" onPress={onSign} style={{ flex: 10 }} themeColor={themeColor} />
      </View>
    </SafeViewContainer>
  );
});
