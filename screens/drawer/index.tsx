import App, { AppVM } from '../../viewmodels/core/App';
import { Arbitrum, EVMIcon, Ethereum, NetworkIcons, Optimism, Polygon } from '../../assets/icons/networks/color';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import Avatar from '../../components/Avatar';
import { DrawerActions } from '@react-navigation/core';
import FastImage from 'react-native-fast-image';
import { INetwork } from '../../common/Networks';
import MessageKeys from '../../common/MessageKeys';
import MetamaskDAppsHub from '../../viewmodels/walletconnect/MetamaskDAppsHub';
import Networks from '../../viewmodels/core/Networks';
import PubSub from 'pubsub-js';
import { ReactiveScreen } from '../../utils/device';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import i18n from '../../i18n';
import icons from '../../assets/icons/crypto';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { bottom, top } = initialWindowMetrics?.insets ?? { bottom: 0, top: 0 };
const contentHeight = ReactiveScreen.height - (bottom + top);

interface DrawerProps extends DrawerContentComponentProps {
  appVM: AppVM;
}

const Drawer = observer((props: DrawerProps) => {
  const { t } = i18n;
  const { navigation, appVM } = props;
  const { currentAccount } = appVM;
  const { current } = Networks;
  const [screenHeight, setScreenHeight] = useState(contentHeight);
  const { borderColor, foregroundColor, textColor, secondaryTextColor, backgroundColor } = Theme;

  const { index } = navigation.getState();

  const { connectedCount } = WalletConnectHub;
  const { dapps } = MetamaskDAppsHub;

  const homeHighlight = index === 0 ? current.color : foregroundColor;
  const contactsHighlight = index === 1 ? current.color : foregroundColor;
  const settingsHighlight = index === 2 ? current.color : foregroundColor;
  const dappsHighlight = index === 3 ? current.color : foregroundColor;

  const fastSwitchNetwork = (network: INetwork) => {
    Networks.switch(network);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const { bottom, top, right, left } = useSafeAreaInsets();

  useEffect(() => {
    const updateScreenHeight = () => {
      const { height, width } = Dimensions.get('window');

      if (height > width) setScreenHeight(height - (bottom + top));
      else setScreenHeight(height - (left + right) - 16);
    };

    const event = Dimensions.addEventListener('change', updateScreenHeight);

    return () => {
      event.remove();
    };
  }, []);

  const navigateTo = (route: string) => {
    navigation.navigate(route);
    setTimeout(() => navigation.dispatch(DrawerActions.closeDrawer()), 200);
  };

  return (
    <SafeViewContainer
      style={{ flex: 1, height: screenHeight, paddingHorizontal: 0, paddingTop: 0, paddingBottom: bottom ? 0 : 16 }}
    >
      <View
        style={{
          marginHorizontal: 16,
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ position: 'relative' }}>
          <Avatar
            size={50}
            uri={currentAccount?.avatar}
            backgroundColor={currentAccount?.emojiColor}
            emoji={currentAccount?.emojiAvatar}
            emojiSize={23}
            emojiMarginStart={2}
          />

          {currentAccount?.poap.primaryBadge ? (
            <FastImage
              source={{
                uri: currentAccount?.poap.primaryBadge?.metadata.image_url,
              }}
              style={{
                width: 16,
                height: 16,
                position: 'absolute',
                right: 0,
                bottom: 0,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: backgroundColor,
                backgroundColor,
              }}
            />
          ) : undefined}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            PubSub.publish(MessageKeys.openAccountsMenu);
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontWeight: '500',
              marginStart: 12,
              fontSize: 17,
              width: '72%',
              color: foregroundColor,
            }}
          >
            {currentAccount?.displayName}
          </Text>

          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 8 }} size={19} color={foregroundColor} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: 12 }}>
        <DrawerItem
          label={t('home-drawer-wallet')}
          onPress={() => navigateTo('Home')}
          labelStyle={{ ...styles.drawerLabel, color: homeHighlight }}
          icon={() => <Feather color={homeHighlight} size={21} name={'home'} />}
        />

        <DrawerItem
          label={t('home-drawer-contacts')}
          onPress={() => navigateTo('Contacts')}
          labelStyle={{ ...styles.drawerLabel, color: contactsHighlight }}
          icon={() => <Feather name="users" size={20} style={{ width: 21, paddingStart: 1 }} color={contactsHighlight} />}
        />

        {connectedCount > 0 || dapps.length > 0 ? (
          <DrawerItem
            label={t('home-drawer-dapps')}
            onPress={() => navigateTo('ConnectedDapps')}
            labelStyle={{ ...styles.drawerLabel, color: dappsHighlight }}
            icon={() => <Feather name="layers" size={20} style={{ width: 21, paddingStart: 1 }} color={dappsHighlight} />}
          />
        ) : undefined}

        <DrawerItem
          label={t('home-drawer-settings')}
          onPress={() => navigateTo('Settings')}
          labelStyle={{ ...styles.drawerLabel, color: settingsHighlight }}
          icon={() => <Feather color={settingsHighlight} size={21} name={'settings'} />}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: 16, paddingBottom: bottom === 0 ? 4 : 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>{t('home-drawer-networks')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Ethereum)} style={styles.smallNetworkContainer}>
              <Ethereum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Arbitrum)} style={styles.smallNetworkContainer}>
              <Arbitrum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Optimism)} style={styles.smallNetworkContainer}>
              <Optimism width={14} height={13} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 4, marginBottom: 8 }} />

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            PubSub.publish(MessageKeys.openNetworksMenu);
          }}
        >
          {NetworkIcons[current.chainId] || <EVMIcon color={current.color} hideEVMTitle />}
          <Text
            style={{ marginStart: 8, fontSize: 16, color: current.color, fontWeight: '500', maxWidth: '80%' }}
            numberOfLines={1}
          >
            {current.network}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}></View>

          <Feather name="chevron-right" size={16} color={current.color} style={{ marginBottom: -2 }} />
        </TouchableOpacity>
      </View>
    </SafeViewContainer>
  );
});

export default (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: Theme.backgroundColor }} scrollEnabled={false}>
      <Drawer {...props} appVM={App} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  smallNetworkContainer: {
    marginHorizontal: 4,
  },

  drawerLabel: {
    fontFamily: 'PingFang HK',
    fontSize: 17,
    marginStart: -16,
    color: fontColor,
  },
});
