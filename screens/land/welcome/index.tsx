import {} from 'react-native';

import { Text, View } from 'react-native-animatable';
import { secondaryFontColor, themeColor } from '../../../constants/styles';

import { Button } from '../../../components';
import { LandStackNavs } from '../navs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import styles from '../styles';
import { useFonts } from 'expo-font';

export default ({ navigation }: NativeStackScreenProps<LandStackNavs, 'Welcome'>) => {
  const [loaded] = useFonts({
    Questrial: require('../../../assets/fonts/Questrial.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 16, alignItems: 'center', paddingBottom: 0 }}>
        <View style={{ flex: 1 }} />
        <Text animation="fadeInUp" style={{ fontFamily: 'Questrial', fontWeight: '600', fontSize: 42, color: '#6186ff' }}>
          Wallet 3
        </Text>
        <Text animation="fadeInUp" delay={500} style={{ color: secondaryFontColor, fontSize: 12, fontWeight: '500' }}>
          A Secure Wallet for Web3
        </Text>
        <View style={{ flex: 1 }} />

        <View style={{ width: '100%' }}>
          <View animation="fadeInUp" delay={300}>
            <Button
              title="Import a wallet"
              onPress={() => navigation.navigate('ImportWallet')}
              style={styles.borderButton}
              txtStyle={{ color: themeColor, textTransform: 'none' }}
            />
          </View>

          <View animation="fadeInUp" delay={500}>
            <Button
              title="Create a new wallet"
              onPress={() => navigation.navigate('CreateWallet')}
              txtStyle={{ textTransform: 'none' }}
            />
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};
