import * as ethers from 'ethers';

import React, { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { Button } from '../../components';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { langToWordlist } from '../../utils/mnemonic';
import { observer } from 'mobx-react-lite';
import { useHeaderHeight } from '@react-navigation/elements';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const headerHeight = useHeaderHeight();
  const { top, bottom } = useSafeAreaInsets();

  const [mnemonic, setMnemonic] = React.useState('');
  const [verified, setVerified] = React.useState(false);

  useEffect(() => {
    setVerified(MnemonicOnce.setMnemonic(mnemonic));
  }, [mnemonic]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ flex: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingBottom: bottom > 0 ? 0 : 16,
          paddingTop: headerHeight - top,
          flex: 1,
          backgroundColor: 'white',
        }}
      >
        <TextInput
          multiline={true}
          numberOfLines={5}
          placeholder="Enter your recovery phrase here"
          onChangeText={(txt) => setMnemonic(txt)}
          autoCapitalize="none"
          keyboardType="default"
          secureTextEntry={true}
          style={{
            height: 200,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: themeColor,
            borderRadius: 10,
            padding: 8,
            paddingVertical: 24,
            fontSize: 16,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            paddingBottom: 2,
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: 17, color: secondaryFontColor }}>Derivation Path</Text>
          <TextInput
            style={{ fontSize: 17, color: themeColor }}
            defaultValue={`m/44'/60'/0'/0/0`}
            onChangeText={(txt) => MnemonicOnce.setDerivationPath(txt)}
          />
        </View>

        <View style={{ flex: 1 }} />

        <Button title="Next" disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </ScrollView>
    </SafeAreaView>
  );
});
