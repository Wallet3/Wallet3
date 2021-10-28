import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../../constants/styles';

import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Assets</Text>
        <Text style={styles.headerLabel}>NFTs</Text>
        <Text style={styles.headerLabel}>History</Text>
      </View>

      <Swiper showsPagination={false} showsButtons={false} style={{}} onIndexChanged={(index) => setActiveTab(index)}>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 1 }}></View>
      </Swiper>
    </View>
  );
});

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
