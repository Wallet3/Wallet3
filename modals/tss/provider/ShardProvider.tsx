import Animated, { FadeInRight, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, FadeInLeftView, FadeInUpView, ZoomInView } from '../../../components/animations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Placeholder, Skeleton } from '../../../components';
import React, { useEffect, useState } from 'react';
import { ShardPersistentStatus, ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import { getDeviceModel, useOptimizedSafeBottom } from '../../../utils/hardware';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import LottieView from 'lottie-react-native';
import { SECOND } from '../../../utils/time';
import { ShardProvider } from '../../../viewmodels/tss/ShardProvider';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../../styles';

const { View, Text, FlatList } = Animated;

export default observer(({ vm, close }: { vm: ShardProvider; close: Function }) => {
  const { textColor, secondaryTextColor } = Theme;
  const { t } = i18n;
  const { remoteInfo, requestType } = vm;

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ marginBottom: 64 }}>
        <View style={styles.reviewItemsContainer}>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemTitle}>{t('multi-sig-modal-txt-device')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Device deviceId={remoteInfo?.device || ''} os={remoteInfo?.rn_os || 'ios'} style={{ height: 24, width: 36 }} />
              <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
                {remoteInfo?.name}
              </Text>
            </View>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemTitle}>OS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {remoteInfo?.rn_os === 'ios' ? (
                <Ionicons name="logo-apple" color={secondaryTextColor} size={15} style={{ marginEnd: 8 }} />
              ) : (
                <MaterialCommunityIcons name="android" size={15} color="yellowgreen" style={{ marginEnd: 10 }} />
              )}

              <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
                {`${remoteInfo?.os} ${remoteInfo?.osVersion}`}
              </Text>
            </View>
          </View>

          <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
            <Text style={styles.reviewItemTitle}>{t('multi-sig-modal-txt-aggregation-request-type')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {requestType ? (
                <Text
                  numberOfLines={1}
                  style={{
                    ...styles.reviewItemValue,
                    maxWidth: 180,
                    fontWeight: '600',
                    color: requestType === 'root' ? warningColor : textColor,
                    textTransform: requestType === 'root' ? 'uppercase' : undefined,
                  }}
                >
                  {t(`multi-sig-modal-txt-aggregation-request-type-${requestType}`)}
                </Text>
              ) : (
                <Skeleton />
              )}
            </View>
          </View>
        </View>
      </View>

      <Placeholder />

      <FadeInDownView delay={300}>
        <Button
          style={{ marginHorizontal: 0 }}
          disabled={!requestType || vm.closed}
          title={t('button-approve')}
          onSwipeSuccess={() => vm.send()}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
});
