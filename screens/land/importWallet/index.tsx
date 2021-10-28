import { ScrollView, Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor } from '../../../constants/styles';

import { Button } from '../../../components';
import { LandStackNavs } from '../navs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default ({ navigation }: NativeStackScreenProps<LandStackNavs, 'Backup'>) => {
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();

  return (
    <ScrollView
      scrollEnabled={false}
      contentContainerStyle={{ flex: 1 }}
      style={{ paddingHorizontal: 16, paddingBottom: bottom, paddingTop: headerHeight, flex: 1, backgroundColor: 'white' }}
    >
      <TextInput
        multiline={true}
        numberOfLines={5}
        placeholder="Enter your mnemonic phrases"
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
        autoCapitalize="none"
        keyboardType="default"
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
        <Text style={{ fontSize: 16, color: secondaryFontColor }}>Derivation Path</Text>
        <TextInput style={{ fontSize: 16, color: themeColor }} defaultValue={`m/44'/60'/0'/0/0`} />
      </View>

      <View style={{ flex: 1 }} />

      <Button title="Next" onPress={() => navigation.navigate('SetupPasscode')} />
    </ScrollView>
  );
};
