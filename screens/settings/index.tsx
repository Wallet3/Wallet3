import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import Authentication from '../../viewmodels/Authentication';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { FullPasspad } from '../../modals/views/Passpad';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type SettingsStack = {
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<SettingsStack, 'Settings'>) => {
  const parent = navigation.getParent();
  const [jumpToScreen, setJumpToScreen] = React.useState('');
  const { ref: authModalRef, open, close } = useModalize();

  const openChangePasscode = () => {
    open();
    setJumpToScreen('ChangePasscode');
  };

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

      <View style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="finger-print-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Biometric</Text>
        </View>

        <View>
          <Switch
            value={Authentication.biometricsEnabled}
            onValueChange={(v) => Authentication.setBiometrics(v)}
            trackColor={{ true: Networks.current.color }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.itemContainer} onPress={() => openChangePasscode()}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="keypad-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Change Passcode</Text>
        </View>

        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Backup')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="file-tray-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Backup</Text>
          <Ionicons name="alert-circle" size={15} color="darkorange" style={{ marginStart: 4, marginTop: -8 }} />
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

      <Portal>
        <Modalize
          ref={authModalRef}
          disableScrollIfPossible
          adjustToContentHeight
          panGestureEnabled={false}
          panGestureComponentEnabled={false}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <FullPasspad
            themeColor={Networks.current.color}
            height={420}
            onCodeEntered={async (code) => {
              const success = await Authentication.verifyPin(code);
              if (success) {
                parent?.navigate(jumpToScreen);
                close();
              }
              return success;
            }}
          />
        </Modalize>
      </Portal>
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
