import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import JSONTree from 'react-native-json-tree';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

const theme = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED',
};

export default observer(
  ({ themeColor, data, onReject, onSign }: { themeColor: string; data: any; onReject: () => void; onSign: () => void }) => {
    return (
      <SafeViewContainer style={{ flex: 1 }}>
        <View style={{ paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: borderColor }}>
          <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>Typed Data Signing</Text>
        </View>

        <ScrollView
          style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 12 }}
          contentContainerStyle={{}}
          bounces={false}
        >
          <JSONTree data={data} hideRoot theme={theme} />
        </ScrollView>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Cancel" onPress={onReject} reverse themeColor={themeColor} style={{ flex: 10 }} />
          <View style={{ width: 12 }} />
          <Button title="Sign" onPress={onSign} style={{ flex: 10 }} themeColor={themeColor} />
        </View>
      </SafeViewContainer>
    );
  }
);
