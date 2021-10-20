import { StyleSheet, Text, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../../../constants/styles';

import React from 'react';
import Swiper from 'react-native-swiper';

export default () => {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Assets</Text>
        <Text style={styles.headerLabel}>NFTs</Text>
        <Text style={styles.headerLabel}>History</Text>
      </View>
      <Swiper showsPagination={false} showsButtons={false}>
        <View></View>
        <View></View>
        <View></View>
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },

  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: secondaryFontColor,
  },

  headerLabelActive: {
    color: fontColor,
    fontWeight: '500',
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '500',
    fontSize: 27,
    fontFamily: 'Avenir Next',
  },
});
