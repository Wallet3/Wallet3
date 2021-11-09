import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { borderColor, secondaryFontColor } from '../constants/styles';

import React from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  phrase: string[];
  style?: StyleProp<ViewStyle>;
}

export default observer((props: Props) => {
  const { phrase } = props;

  const rows = Math.ceil(phrase.length / 4);
  const rowWords: string[][] = phrase.length === 0 ? new Array(3).fill(new Array(4).fill('')) : [];

  for (let i = 0; i < rows; i++) {
    const row: string[] = [];

    for (let j = 0; j < 4; j++) {
      row[j] = phrase[i * 4 + j];
    }

    rowWords.push(row);
  }

  const renderRow = ({ words, row }: { words: string[]; row: number }) => {
    return (
      <View key={row} style={{ flexDirection: 'row' }}>
        {words.map((word, i) => (
          <View
            key={`${word}-${i}`}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomColor: borderColor,
              borderBottomWidth: rows === row + 1 ? 0 : 1,
              borderRightColor: borderColor,
              borderRightWidth: i === 3 ? 0 : 1,
              position: 'relative',
            }}
          >
            {word ? (
              <Text style={{ position: 'absolute', fontSize: 8, left: 4, top: 4, color: secondaryFontColor }}>
                {row * 4 + i + 1}
              </Text>
            ) : undefined}
            <Text numberOfLines={1} style={{ fontSize: 15 }}>
              {word}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ borderColor, borderWidth: 1, borderRadius: 7, ...((props.style as any) || {}) }}>
      {rowWords.map((words, row) => {
        return renderRow({ words, row });
      })}
    </View>
  );
});
