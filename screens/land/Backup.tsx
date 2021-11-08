import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { SortedSecretWords, StaticSecretWords } from '../components/SecretWords';
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
  const [sorted, setSorted] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  const onStaticWordPress = (word: string, index: number) => {
    setSorted((pre) => [...pre, word]);
    setShuffled((pre) => [...pre.slice(0, index), ...pre.slice(index + 1)]);
  };

  const delSortedWord = (word: string, index: number) => {
    setSorted((pre) => [...pre.slice(0, index), ...pre.slice(index + 1)]);
    setShuffled((pre) => [...pre, word]);
  };

  useEffect(() => setShuffled(_.shuffle(MnemonicOnce.secretWords)), []);

  useEffect(() => {
    setVerified(_.isEqual(sorted, MnemonicOnce.secretWords));
  }, [sorted]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={{ ...styles.rootContainer, paddingTop: 0 }}>
        <Text>Please sort the words correctly. </Text>

        <SortedSecretWords words={sorted.filter((i) => i)} onDelWord={delSortedWord} />

        <StaticSecretWords words={shuffled} onWordPress={onStaticWordPress} />

        <View style={{ flex: 1 }} />

        <Button title="Next" disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
