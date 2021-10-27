import { SafeAreaView, Text, TouchableHighlight, View } from 'react-native';

import { Button } from '../../../components';
import React from 'react';
import { borderColor } from '../../../constants/styles';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

const phrases = 'brisk casual lunch sudden trust path impose october prosper chunk deposit claw become oil strike'.split(' ');

export default observer(() => {
  const renderStaticWord = (words: string[]) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <TouchableHighlight
          underlayColor={borderColor}
          key={index}
          onPress={() => {}}
          style={{
            padding: 12,
            paddingVertical: 8,
            borderColor,
            borderWidth: 1,
            borderRadius: 7,
            marginEnd: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{}}>{word}</Text>
        </TouchableHighlight>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootContainer}>
        <Text>Please sort the words correctly. </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            backgroundColor: borderColor,
            borderRadius: 10,
            borderWidth: 1,
            borderColor,
            marginVertical: 12,
            height: 200,
            padding: 12,
          }}
        >
          <View>
            <Text></Text>
          </View>
        </View>

        {renderStaticWord(phrases)}

        <View style={{ flex: 1 }} />
        <Button title="Next" />
      </View>
    </SafeAreaView>
  );
});
