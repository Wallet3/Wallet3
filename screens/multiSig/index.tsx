import { ButtonV2, NullableImage, SafeViewContainer } from '../../components';
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderColor, secondaryFontColor, secureColor, verifiedColor, warningColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/core/App';
import Button from '../../modals/tss/components/Button';
import Collapsible from 'react-native-collapsible';
import { DrawerActions } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import IllustrationNoData from '../../assets/illustrations/misc/nodata.svg';
import IllustrationPairing from '../../assets/illustrations/misc/pair_programming.svg';
import MessageKeys from '../../common/MessageKeys';
import { MetamaskDApp } from '../../viewmodels/walletconnect/MetamaskDApp';
import MetamaskDAppsHub from '../../viewmodels/walletconnect/MetamaskDAppsHub';
import { Modalize } from 'react-native-modalize';
import NetworkSelector from '../../modals/dapp/NetworkSelector';
import Networks from '../../viewmodels/core/Networks';
import { Portal } from 'react-native-portalize';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import { WalletConnect as WalletConnectLogo } from '../../assets/3rd';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../../viewmodels/walletconnect/WalletConnect_v2';
import { ZoomInView } from '../../components/animations';
import i18n from '../../i18n';
import modalStyle from '../../modals/styles';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../common/Modals';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

export default observer(({ navigation }: DrawerScreenProps<{}, never>) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;
  const { currentWallet } = App;

  const { top } = useSafeAreaInsets();
  const { t } = i18n;
  const headerScroller = useRef<FlatList>(null);
  const swiper = useRef<Swiper>(null);

  const headerHeight = 49;
  const scrollToIndex = (index: number) => {
    headerScroller.current?.scrollToIndex({ index, animated: true });
    setCurrentPage(index);
  };

  const openShardsDistributor = () => {
    const getSecret = async (pin?: string) => {
      const secret = await currentWallet?.getSecret(pin);
      return secret !== undefined;
    };

    openGlobalPasspad({ onAutoAuthRequest: getSecret, onPinEntered: getSecret });
  };

  const logos = [
    <View
      key="paired_devices"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <Ionicons name="phone-portrait-outline" size={15} color={textColor} />
      <Text style={{ color: textColor, fontWeight: '600', marginHorizontal: 8, fontSize: 18, textTransform: 'capitalize' }}>
        {t('multi-sig-screen-paired-devices')}
      </Text>
    </View>,
    <View
      key="my_multiSig_wallet"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <MaterialCommunityIcons name="key-chain-variant" color={textColor} size={19} />
      <Text style={{ color: textColor, fontWeight: '600', marginStart: 8, fontSize: 18 }}>
        {t('multi-sig-modal-title-welcome')}
      </Text>
    </View>,
  ];

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.333, borderBottomColor: systemBorderColor }}
      >
        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', zIndex: 9 }}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        >
          <Feather name="menu" size={20} color={foregroundColor} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: -2,
          }}
        >
          <FlatList
            ref={headerScroller}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            data={logos}
            renderItem={({ item }) => item}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            style={{ height: headerHeight }}
          />
        </View>

        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', right: 0, bottom: 4, zIndex: 9 }}
          onPress={() => {
            const to = currentPage === 1 ? 0 : 1;
            scrollToIndex(to);
            swiper.current?.scrollTo(to, true);
          }}
        >
          {currentPage === 0 ? (
            <MaterialCommunityIcons name="key-chain-variant" color={textColor} size={21} />
          ) : (
            <Ionicons name="phone-portrait-outline" size={18} color={textColor} />
          )}
        </TouchableOpacity>
      </View>

      <Swiper ref={swiper} showsPagination={false} showsButtons={false} loop={false} onIndexChanged={scrollToIndex}>
        <SafeViewContainer style={{ width: '100%', height: '100%' }}>
          <View style={{ alignSelf: 'center', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <IllustrationPairing width={150} height={150} />
            <Text style={{ color: secondaryTextColor, textTransform: 'capitalize', fontWeight: '500' }}>
              {t('multi-sig-screen-txt-no-paired-devices')}
            </Text>
          </View>

          {/* <FlatList style={{ flexGrow: 1 }} data={[]} renderItem={(i) => <View />} /> */}

          <ButtonV2
            title={t('button-start-pairing')}
            icon={() => <Ionicons name="phone-portrait-outline" color="#fff" size={17} />}
            style={{ marginTop: 16 }}
            onPress={() => PubSub.publish(MessageKeys.openShardReceiver)}
          />
        </SafeViewContainer>

        <SafeViewContainer>
          {!currentWallet?.isMultiSig && (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Text style={{ color: textColor, fontWeight: '500', marginTop: 12, textAlignVertical: 'center' }}>
                <Ionicons name="arrow-up-circle" size={15} />
                {` ${t('multi-sig-screen-tip-upgrade-to-multi-sig-wallet')}`}
              </Text>
            </View>
          )}

          {currentWallet?.isMultiSig && <FlatList style={{}} data={[]} renderItem={(i) => <View />} />}

          <ButtonV2
            title={t('button-upgrade')}
            style={{ marginTop: 24 }}
            themeColor={secureColor}
            icon={() => <Ionicons name="arrow-up-circle-outline" color="#fff" size={19} />}
            onPress={openShardsDistributor}
          />
        </SafeViewContainer>
      </Swiper>
    </View>
  );
});
