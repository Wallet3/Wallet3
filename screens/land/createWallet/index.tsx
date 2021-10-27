import { Button, Mnemonic } from '../../../components';
import { SafeAreaView, Text, View } from 'react-native';
import { secondaryFontColor, themeColor } from '../../../constants/styles';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { WelcomeStackParamList } from '../navs';
import styles from '../styles';

const phrases = 'brisk casual lunch sudden trust path impose october prosper chunk deposit claw become oil strike'.split(' ');

export default ({ navigation }: NativeStackScreenProps<WelcomeStackParamList, 'Backup'>) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <MaterialCommunityIcons name="shield-key" size={96} color={'yellowgreen'} />
        </View>

        <View style={{ marginVertical: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: themeColor, marginBottom: 8 }}>Security Tips</Text>
          <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>
            The mnemonic consists of english words, please keep them safe.
          </Text>
          <Text style={{ marginStart: 16, color: secondaryFontColor }}>
            Once the mnemonic gets lost, it cannot be retrieved, and you would lose all your funds.
          </Text>
        </View>

        <Mnemonic phrases={phrases} />

        <View style={{ flex: 1 }} />

        <Button title="Backup later" style={styles.borderButton} txtStyle={{ color: themeColor, textTransform: 'none' }} />
        <Button title="Backup now" txtStyle={{ textTransform: 'none' }} onPress={() => navigation.navigate('Backup')} />
      </View>
    </SafeAreaView>
  );
};
