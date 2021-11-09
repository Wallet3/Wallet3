import { Button, SafeViewContainer } from '../../components';
import { SafeAreaView, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

export default observer((props) => {
  const { ref, open, close } = useModalize();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeViewContainer style={{ flex: 1 }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1 }} />
        <Button title="Reset" themeColor="crimson" onPress={() => open()} />
      </SafeViewContainer>

      <Portal>
        <Modalize ref={ref} modalHeight={270} disableScrollIfPossible>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, height: 270 }}>
              <SafeViewContainer style={{ flex: 1 }}>
                <View style={{ flex: 1 }} />

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="warning" size={72} color="crimson" />
                  <Text style={{ color: 'crimson' }}>I'm sure to erase all data.</Text>
                </View>

                <View style={{ flex: 1 }} />
                <Button title="Confirm" />
              </SafeViewContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </SafeAreaView>
  );
});
