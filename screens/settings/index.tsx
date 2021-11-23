import { Button, SafeViewContainer } from '../../components';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import CurrencyViewmodel from '../../viewmodels/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { FullPasspad } from '../../modals/views/Passpad';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { styles as appStyles } from '../../constants/styles';
import { observer } from 'mobx-react-lite';
import { openURL } from 'expo-linking';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type SettingsStack = {
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<SettingsStack, 'Settings'>) => {
  const parent = navigation.getParent();
  const [jumpToScreen, setJumpToScreen] = React.useState('');
  const { ref: passcodeRef, open: openPasscode, close: closePasscode } = useModalize();
  const { ref: resetRef, open: openReset, close: closeReset } = useModalize();

  const openChangePasscode = () => {
    openPasscode();
    setJumpToScreen('ChangePasscode');
  };

  const openResetApp = () => {
    openPasscode();
    setJumpToScreen('ResetApp');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }} alwaysBounceVertical={false}>
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
          <Text style={styles.itemText2}>{CurrencyViewmodel.currentCurrency?.currency}</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Security</Text>

      {Authentication.biometricsSupported ? (
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
      ) : undefined}

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
          {!Authentication.userSecretsVerified ? (
            <Ionicons name="alert-circle" size={15} color="darkorange" style={{ marginStart: 4, marginTop: -8 }} />
          ) : undefined}
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => openResetApp()}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="backspace-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Reset App</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Legal</Text>

      {/* <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="flask-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Terms of Service</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.itemContainer} onPress={() => openURL('https://chainbow.co.jp/privacy.html')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="magnet-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>Privacy Policy</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('About')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="information-circle-outline" style={styles.itemStartSymbol} size={16} />
          <Text style={styles.itemText}>About</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <Portal>
        <Modalize
          ref={passcodeRef}
          disableScrollIfPossible
          adjustToContentHeight
          panGestureEnabled={false}
          panGestureComponentEnabled={false}
          modalStyle={appStyles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <FullPasspad
            themeColor={Networks.current.color}
            height={420}
            onCodeEntered={async (code) => {
              const success = await Authentication.verifyPin(code);
              if (success) {
                if (jumpToScreen === 'ResetApp') setTimeout(() => openReset(), 25);
                else parent?.navigate(jumpToScreen);

                closePasscode();
              }
              return success;
            }}
          />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          ref={resetRef}
          modalHeight={270}
          disableScrollIfPossible
          modalStyle={appStyles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <SafeAreaProvider>
            <SafeViewContainer style={{ flex: 1, height: 270 }}>
              <View style={{ flex: 1 }} />

              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="warning" size={72} color="crimson" />
                <Text style={{ color: 'crimson' }}>I'm sure to erase all data.</Text>
              </View>

              <View style={{ flex: 1 }} />

              <Button title="Confirm" themeColor="crimson" onPress={() => App.reset()} />
            </SafeViewContainer>
          </SafeAreaProvider>
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
