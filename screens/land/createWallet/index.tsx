import { Button, Mnemonic } from '../../../components';
import { SafeAreaView, Text, View } from 'react-native';
import { secondaryFontColor, themeColor } from '../../../constants/styles';

import { LandStackNavs } from '../navs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

const phrases = 'brisk casual lunch sudden trust path impose october prosper chunk deposit claw become oil strike'.split(' ');

export default observer(({ navigation }: NativeStackScreenProps<LandStackNavs, 'Backup'>) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
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

        <Mnemonic phrases={phrases} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryFontColor }}>0xABCDE....09872</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
              <Text>12</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, marginTop: -2 }}>/</Text>
            <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 4, zIndex: 5 }}>
              <Text>24</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title="Backup later"
          style={styles.borderButton}
          txtStyle={{ color: themeColor, textTransform: 'none' }}
          onPress={() => navigation.navigate('SetupPasscode')}
        />
        <Button title="Backup now" txtStyle={{ textTransform: 'none' }} onPress={() => navigation.navigate('Backup')} />
      </View>
    </SafeAreaView>
  );
});
