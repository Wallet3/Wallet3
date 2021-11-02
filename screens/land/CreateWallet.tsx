import { Button, Mnemonic, SafeViewContainer } from '../../components';
import React, { useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { LandStackNavs } from './navs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandStackNavs, 'Backup'>) => {
  useEffect(() => {
    MnemonicOnce.generate();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={styles.rootContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 0 }}>
          <MaterialCommunityIcons name="shield-key" size={72} color={'yellowgreen'} />
        </View>

        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: themeColor, marginBottom: 8 }}>Security Tips</Text>
          <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>
            The mnemonic consists of english words, please keep them safe.
          </Text>
          <Text style={{ marginStart: 16, color: secondaryFontColor }}>
            Once the mnemonic gets lost, it cannot be retrieved, and you would lose all your funds.
          </Text>
        </View>

        <Mnemonic phrases={MnemonicOnce.secretWords} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryFontColor }}></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 8, paddingEnd: 10 }} onPress={() => MnemonicOnce.generate(12)}>
              <Text style={{ color: MnemonicOnce.secretWords.length === 12 ? fontColor : secondaryFontColor }}>12</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, marginTop: -2 }}>/</Text>
            <TouchableOpacity style={{ padding: 8, zIndex: 5 }} onPress={() => MnemonicOnce.generate(24)}>
              <Text style={{ color: MnemonicOnce.secretWords.length === 24 ? fontColor : secondaryFontColor }}>24</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title="Backup later"
          disabled={MnemonicOnce.secretWords.length < 12}
          style={styles.borderButton}
          txtStyle={{ color: themeColor, textTransform: 'none' }}
          onPress={() => navigation.navigate('SetupPasscode')}
        />

        <Button
          title="Backup now"
          disabled={MnemonicOnce.secretWords.length < 12}
          txtStyle={{ textTransform: 'none' }}
          onPress={() => navigation.navigate('Backup')}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
