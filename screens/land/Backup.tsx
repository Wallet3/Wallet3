import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { SortWords, SortedSecretWords, StaticSecretWords } from '../components/SecretWords';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const [verified, setVerified] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={{ ...styles.rootContainer, paddingTop: 0 }}>
        <Text>Please sort the words correctly. </Text>

        <SortWords words={MnemonicOnce.secretWords} onVerified={(v) => setVerified(v)} />

        <View style={{ flex: 1 }} />

        <Button title="Next" disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
