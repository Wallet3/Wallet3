import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../../constants/styles';

import { Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import { LandStackNavs } from '../navs';
import MnemonicOnce from '../../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

export default observer(({ navigation }: NativeStackScreenProps<LandStackNavs, 'Backup'>) => {
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

  const renderStaticWords = (words: string[]) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <TouchableHighlight
          underlayColor={borderColor}
          key={index}
          onPress={() => onStaticWordPress(word, index)}
          style={{
            padding: 12,
            paddingVertical: 8,
            borderColor,
            borderWidth: 1,
            borderRadius: 7,
            marginEnd: 12,
            marginBottom: 8,
          }}
        >
          <Text style={{}}>{word}</Text>
        </TouchableHighlight>
      ))}
    </View>
  );

  const renderSortedWords = (words: string[]) => (
    <ScrollView
      contentContainerStyle={{
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
      style={{
        backgroundColor: borderColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor,
        marginVertical: 12,
        maxHeight: 200,
      }}
    >
      {words.map((word, index) => (
        <View
          key={index}
          style={{
            padding: 12,
            paddingEnd: 0,
            paddingVertical: 0,
            borderColor: secondaryFontColor,
            borderWidth: 1,
            borderRadius: 7,
            marginEnd: 12,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14 }}>{word}</Text>
          <TouchableOpacity
            onPress={() => delSortedWord(word, index)}
            style={{
              paddingStart: 8,
              paddingVertical: 8,
              paddingEnd: 8,
              marginBottom: -2,
            }}
          >
            <Ionicons name="close" size={12} color={fontColor} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootContainer}>
        <Text>Please sort the words correctly. </Text>

        {renderSortedWords(sorted.filter((i) => i))}

        {renderStaticWords(shuffled)}

        <View style={{ flex: 1 }} />

        <Button title="Next" disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </View>
    </SafeAreaView>
  );
});
