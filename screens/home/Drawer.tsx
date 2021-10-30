import App, { AppVM } from '../../viewmodels/App';
import { Arbitrum, Ethereum, NetworkIcons, Optimism, Polygon } from '../../assets/icons/networks/color';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { DrawerActions } from '@react-navigation/core';
import PubSub from 'pubsub-js';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

const { bottom, top } = initialWindowMetrics?.insets ?? { bottom: 0, top: 0 };
const screenHeight = Dimensions.get('window').height - (bottom + top);

interface DrawerProps extends DrawerContentComponentProps {
  appVM: AppVM;
}

const Drawer = observer((props: DrawerProps) => {
  const { navigation, appVM } = props;
  const { currentWallet } = appVM;

  return (
    <SafeViewContainer style={{ flex: 1, height: screenHeight, paddingHorizontal: 0, paddingTop: 0 }}>
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
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#00bfff',
          }}
          source={{
            uri: 'https://lh3.googleusercontent.com/xoSEsxi45bAjWFvxbAWX-Sng4AeEyU7NfA9vJ9k-UpX_1qoP0JrdNI-njQ0K8A1gm1cJqv4j_P-cMZuedCgQ3ik=w600',
          }}
        />

        <Text
          style={{
            fontWeight: '500',
            marginStart: 12,
            fontSize: 17,
            maxWidth: '70%',
          }}
          numberOfLines={1}
        >
          {currentWallet?.currentAccount?.displayName}
        </Text>
      </View>

      <View style={{ paddingBottom: 12 }}>
        <DrawerItem
          label="Wallet"
          onPress={() => navigation.navigate('Home')}
          labelStyle={{ fontSize: 17, marginStart: -16, color: fontColor }}
          icon={({ color, size }) => <SimpleLineIcons color={fontColor} size={size} name={'wallet'} />}
        />

        <DrawerItem
          label="Settings"
          onPress={() => navigation.navigate('Details')}
          labelStyle={{ fontSize: 17, marginStart: -16, color: fontColor }}
          icon={({ color, size }) => <SimpleLineIcons color={fontColor} size={size} name={'settings'} />}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryFontColor, fontSize: 14 }}>Networks</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Details')} style={styles.smallNetworkContainer}>
              <Ethereum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallNetworkContainer}>
              <Arbitrum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallNetworkContainer}>
              <Optimism width={14} height={13} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 4, marginBottom: 8 }} />
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            PubSub.publish('openNetworksModal');
          }}
        >
          {NetworkIcons['ethereum']}
          <Text style={{ marginStart: 8, fontSize: 16, color: '#6186ff', fontWeight: '500' }}>Ethereum</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}></View>

          <Feather name="chevron-right" size={16} color={'#6186ff'} style={{ marginBottom: -2 }} />
        </TouchableOpacity>
      </View>
    </SafeViewContainer>
  );
});

export default (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} scrollEnabled={false}>
      <Drawer {...props} appVM={App} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  smallNetworkContainer: {
    marginHorizontal: 4,
  },
});
