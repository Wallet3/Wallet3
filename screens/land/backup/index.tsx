import { SafeAreaView, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../../constants/styles';

import { Button } from '../../../components';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

const phrases = 'brisk casual lunch sudden trust path impose october prosper chunk deposit claw become oil strike'.split(' ');

export default observer(() => {
  const renderStaticWords = (words: string[]) => (
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootContainer}>
        <Text>Please sort the words correctly. </Text>

        {renderSortedWords([...phrases].slice(0, 24))}

        {renderStaticWords(phrases)}

        <View style={{ flex: 1 }} />
        <Button title="Next" />
      </View>
    </SafeAreaView>
  );
});
