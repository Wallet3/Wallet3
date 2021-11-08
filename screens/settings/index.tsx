import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';

type SettingsStack = {
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<SettingsStack, 'Settings'>) => {
  const parent = navigation.getParent();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>General</Text>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Languages')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="language-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Languages</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Text style={styles.itemText2}>English</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Currencies')}>
        <View style={styles.itemSubContainer}>
          <MaterialCommunityIcons name="currency-eth" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Currency</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Text style={styles.itemText2}>USD</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Security</Text>

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="shield-checkmark-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Change Passcode</Text>
        </View>

        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="file-tray-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Backup</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="backspace-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Reset App</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Legal</Text>

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="flask-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Terms of Service</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="magnet-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Privacy Policy</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <Text style={{ marginTop: 24, fontSize: 12 }}>© 2021 ChainBow</Text>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },

  itemSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemText: {
    fontSize: 17,
    color: fontColor,
  },

  itemText2: {
    fontSize: 17,
    color: secondaryFontColor,
  },

  itemStartSymbol: {
    marginEnd: 12,
  },

  itemEndSymbol: {
    color: secondaryFontColor,
    marginStart: 8,
  },

  sectionTitle: {
    color: secondaryFontColor,
    marginTop: 32,
    marginBottom: 4,
  },
});
