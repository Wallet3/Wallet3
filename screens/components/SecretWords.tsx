import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import Enumerable from 'linq';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';

export const StaticSecretWords = observer(
  ({ words, onWordPress, color }: { color: string; words: string[]; onWordPress: (word: string, index: number) => void }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <TouchableHighlight
          underlayColor={borderColor}
          key={index}
          onPress={() => onWordPress(word, index)}
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
          <Text style={{ color }}>{word}</Text>
        </TouchableHighlight>
      ))}
    </View>
  )
);

export const SortedSecretWords = observer(
  ({ words, onDelWord }: { words: string[]; onDelWord: (word: string, index: number) => void }) => (
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
        height: 200,
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
            onPress={() => onDelWord(word, index)}
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
  )
);

export const SortWords = ({
  words,
  onVerified,
  color,
}: {
  words: string[];
  onVerified: (success: boolean) => void;
  color: string;
}) => {
  const [sorted, setSorted] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);

  const onStaticWordPress = (word: string, index: number) => {
    setSorted((pre) => [...pre, word]);
    setShuffled((pre) => [...pre.slice(0, index), ...pre.slice(index + 1)]);
  };

  const delSortedWord = (word: string, index: number) => {
    setSorted((pre) => [...pre.slice(0, index), ...pre.slice(index + 1)]);
    setShuffled((pre) => [...pre, word]);
  };

  useEffect(() => setShuffled(Enumerable.from(words).shuffle().toArray()), []);

  useEffect(() => {
    onVerified(Enumerable.from(sorted).sequenceEqual(words));
  }, [sorted]);

  return (
    <View>
      <SortedSecretWords words={sorted.filter((i) => i)} onDelWord={delSortedWord} />

      <StaticSecretWords color={color} words={shuffled} onWordPress={onStaticWordPress} />
    </View>
  );
};
