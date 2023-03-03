import { FadeInDownView, FadeInUpView } from '../../components/animations';
import { FlatList, Text, View } from 'react-native';
import { secureColor, warningColor } from '../../constants/styles';

import BackableScrollTitles from '../components/BackableScrollTitles';
import Button from '../tss/components/Button';
import { ClientInfo } from '../../common/p2p/Constants';
import { DateTimeFormatter } from '../../utils/formatter';
import Device from '../../components/Device';
import IllustrationUpgrade from '../../assets/illustrations/misc/upgrade.svg';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../core/ModalRootContainer';
import { MultiSigKeyDeviceInfo } from '../../models/entities/MultiSigKey';
import { Placeholder } from '../../components';
import React from 'react';
import { ReactiveScreen } from '../../utils/device';
import Theme from '../../viewmodels/settings/Theme';
import dayjs from 'dayjs';
import i18n from '../../i18n';
import iosDevice from 'ios-device-list';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../tss/components/Utils';
import { useNavigation } from '@react-navigation/native';

export default observer(({ onDone, devices }: { onDone: () => void; devices: MultiSigKeyDeviceInfo[] }) => {
  const { t } = i18n;
  const navigation = useNavigation<any>();
  const marginHorizontal = useHorizontalPadding();
  const { secondaryTextColor } = Theme;

  const goToBackup = () => {
    onDone();
    navigation.navigate('MultiSig');
  };

  const renderItem = ({ item }: { item: MultiSigKeyDeviceInfo }) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, paddingHorizontal: marginHorizontal, paddingVertical: 8 }}>
        <Device deviceId={item.device} os={item.rn_os} style={{ width: 32, height: 42, opacity: 0.5 }} />
        <View style={{ flex: 1, marginStart: 12 }}>
          <Text style={{ color: secondaryTextColor, fontSize: 17, fontWeight: '500' }} numberOfLines={1}>
            {iosDevice.generationByIdentifier(item.device)}
          </Text>
          <Placeholder />
          <Text style={{ color: warningColor, marginBottom: -2, fontWeight: '500' }} numberOfLines={1}>
            {/* <Ionicons name="warning" size={14} /> */}
            {`${t('multi-sig-modal-txt-last-used-time')}: ${dayjs(item.lastUsedAt).format(DateTimeFormatter)}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ModalRootContainer style={{}}>
      <BackableScrollTitles titles={[t('multi-sig-modal-title-inactive-devices')]} txtStyle={{ color: warningColor }} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16, marginTop: 8 }}>
        <FadeInUpView style={{ flex: 1 }} delay={500}>
          <Text style={{ color: secondaryTextColor, fontSize: 12, marginHorizontal, fontWeight: '500' }}>
            {t('multi-sig-modal-msg-inactive-devices')}
          </Text>
          <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(i) => i.globalId}
            contentContainerStyle={{ paddingVertical: 8 }}
            bounces={devices.length > 4}
          />
        </FadeInUpView>

        <FadeInDownView delay={700}>
          <Button
            themeColor={warningColor}
            title={t('modal-siwe-see-details')}
            txtStyle={{ textTransform: 'none' }}
            onPress={() => goToBackup()}
          />
        </FadeInDownView>
      </View>
    </ModalRootContainer>
  );
});
