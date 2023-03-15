import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Placeholder, Skeleton } from '../../../components';
import React, { useEffect, useState } from 'react';

import Animated from 'react-native-reanimated';
import Button from '../components/Button';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import { ShardProvider } from '../../../viewmodels/tss/ShardProvider';
import Success from '../../views/Success';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import styles from '../../styles';

const { View, Text } = Animated;

export default observer(({ vm, close }: { vm: ShardProvider; close: Function }) => {
  const { textColor, secondaryTextColor } = Theme;
  const { t } = i18n;
  const { remoteInfo, requestType, closed } = vm;
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const exec = async () => {
    setBusy(true);

    try {
      if (!(await vm.send())) return;
      setSuccess(true);
      setTimeout(() => close(), 2100);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FadeInDownView style={{ flex: 1 }}>
      {success ? (
        <Success />
      ) : (
        <View style={styles.reviewItemsContainer}>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemTitle}>{t('multi-sig-modal-txt-device')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {remoteInfo && (
                <Device deviceId={remoteInfo.device} os={remoteInfo?.rn_os || 'ios'} style={{ height: 24, width: 36 }} />
              )}

              {remoteInfo ? (
                <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
                  {remoteInfo.name}
                </Text>
              ) : (
                <Skeleton style={{ width: 64 }} />
              )}
            </View>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemTitle}>OS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {remoteInfo ? (
                remoteInfo.rn_os === 'ios' ? (
                  <Ionicons name="logo-apple" color={secondaryTextColor} size={15} style={{ marginEnd: 8 }} />
                ) : (
                  <MaterialCommunityIcons name="android" size={15} color="yellowgreen" style={{ marginEnd: 10 }} />
                )
              ) : undefined}

              {remoteInfo ? (
                <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
                  {`${remoteInfo?.os} ${remoteInfo?.osVersion}`}
                </Text>
              ) : (
                <Skeleton style={{ width: 64 }} />
              )}
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
                    color: textColor,
                    textTransform: 'capitalize',
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
      )}

      {success ? undefined : <Placeholder />}

      <FadeInDownView delay={300}>
        <Button
          style={{ marginHorizontal: 0 }}
          disabled={!requestType || closed || busy || success}
          title={t('button-approve')}
          onPress={exec}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
});
