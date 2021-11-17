import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import JSONTree from 'react-native-json-tree';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer(
  ({ themeColor, data, onReject, onSign }: { themeColor: string; data: any; onReject: () => void; onSign: () => void }) => {
    return (
      <SafeViewContainer style={{ flex: 1 }}>
        <View style={{ paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: borderColor }}>
          <Text style={{ fontSize: 24, color: themeColor, fontWeight: '500' }}>Typed Data Signing</Text>
        </View>

        <ScrollView
          style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 8 }}
          contentContainerStyle={{}}
          bounces={false}
        >
          <JSONTree data={data} hideRoot shouldExpandNode={() => true} />
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
