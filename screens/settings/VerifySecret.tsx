import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import AnimatedLottieView from 'lottie-react-native';
import Authentication from '../../viewmodels/Authentication';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SortWords } from '../components/SecretWords';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const [verified, setVerified] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ flex: 1 }}>
        {verified ? (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }} />

            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
              <AnimatedLottieView
                style={{
                  width: 200,
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                loop={false}
                autoPlay
                source={require('../../assets/animations/success.json')}
              />
            </View>

            <View style={{ flex: 1 }} />

            <Button title="OK" onPress={() => navigation.popToTop()} txtStyle={{ textTransform: 'uppercase' }} />
          </View>
        ) : (
          <View>
            <Text>Please sort the words correctly. </Text>
            <SortWords
              words={MnemonicOnce.secretWords}
              onVerified={(v) => {
                setVerified(v);
                if (v) Authentication.setUserSecretsVerified(true);
              }}
            />
          </View>
        )}
      </SafeViewContainer>
    </SafeAreaView>
  );
});
