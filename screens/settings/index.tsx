import { Button, SafeViewContainer } from '../../components';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import { Confirm } from '../../modals/views/Confirm';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { FullPasspad } from '../../modals/views/Passpad';
import Langs from '../../viewmodels/settings/Langs';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import UI from '../../viewmodels/settings/UI';
import { styles as appStyles } from '../../constants/styles';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openURL } from 'expo-linking';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type SettingsStack = {
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<SettingsStack, 'Settings'>) => {
  const { t } = i18n;

  const parent = navigation.getParent();
  const [jumpToScreen, setJumpToScreen] = React.useState('');
  const { ref: passcodeRef, open: openPasscode, close: closePasscode } = useModalize();
  const { ref: resetRef, open: openReset, close: closeReset } = useModalize();
  const { foregroundColor, textColor, backgroundColor, mode } = Theme;

  const openChangePasscode = () => {
    openPasscode();
    setJumpToScreen('ChangePasscode');
  };

  const openResetApp = () => {
    openPasscode();
    setJumpToScreen('ResetApp');
  };

  const itemText = { ...styles.itemText, color: textColor };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} alwaysBounceVertical={false}>
      <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>{t('settings-general')}</Text>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Languages')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="language-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-general-language')}</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Text style={styles.itemText2}>{Langs.currentLang.name}</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Currencies')}>
        <View style={styles.itemSubContainer}>
          <MaterialCommunityIcons name="currency-eth" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-general-currency')}</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Text style={styles.itemText2}>{CurrencyViewmodel.currentCurrency?.currency}</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Themes')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="color-palette-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-general-theme')}</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Text style={styles.itemText2}>{t(`settings-general-theme-${mode}`)}</Text>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <View style={styles.itemContainer}>
        <View style={styles.itemSubContainer}>
          <MaterialCommunityIcons name="gas-station" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-general-gas-indicator')}</Text>
        </View>

        <View>
          <Switch
            value={UI.gasIndicator}
            onValueChange={(v) => UI.switchGasIndicator(v)}
            trackColor={{ true: Networks.current.color }}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('settings-security')}</Text>

      {Authentication.biometricsSupported ? (
        <View style={styles.itemContainer}>
          <View style={styles.itemSubContainer}>
            <Ionicons name="finger-print-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
            <Text style={itemText}>{t('settings-security-biometric')}</Text>
          </View>

          <View>
            <Switch
              value={Authentication.biometricEnabled}
              onValueChange={(v) => Authentication.setBiometrics(v)}
              trackColor={{ true: Networks.current.color }}
            />
          </View>
        </View>
      ) : undefined}

      <TouchableOpacity style={styles.itemContainer} onPress={() => openChangePasscode()}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="keypad-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-security-passcode')}</Text>
        </View>

        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('Backup')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="file-tray-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-security-backup')}</Text>
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
          <Ionicons name="backspace-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-security-reset')}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('settings-legal')}</Text>

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
          <Ionicons name="magnet-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-legal-privacy')}</Text>
        </View>
        <View style={styles.itemSubContainer}>
          <Entypo name="chevron-right" style={styles.itemEndSymbol} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContainer} onPress={() => parent?.navigate('About')}>
        <View style={styles.itemSubContainer}>
          <Ionicons name="information-circle-outline" style={styles.itemStartSymbol} size={16} color={textColor} />
          <Text style={itemText}>{t('settings-legal-about')}</Text>
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
            borderRadius={6}
            onCodeEntered={async (code) => {
              const success = await Authentication.verifyPin(code);
              if (!success) return false;

              if (jumpToScreen === 'ResetApp') {
                setTimeout(() => openReset(), 25);
              } else {
                parent?.navigate(jumpToScreen);
              }

              closePasscode();
              return true;
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
          <SafeAreaProvider style={{ height: 270, backgroundColor }}>
            <Confirm
              onSwipeConfirm={() => App.reset()}
              confirmButtonTitle={t('settings-reset-modal-button-confirm')}
              desc={t('settings-modal-erase')}
              themeColor="crimson"
              style={{ flex: 1 }}
            />
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
