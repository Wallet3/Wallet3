import { StyleSheet, Text, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { INetwork } from '../../common/Networks';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import { WCCallRequestRequest } from '../../models/WCSession_v1';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

export default observer(
  ({
    client,
    request,
    network,
    onReject,
    onApprove,
  }: {
    client: WalletConnect_v1;
    network?: INetwork;
    request: WCCallRequestRequest;
    onReject?: () => void;
    onApprove?: () => void;
  }) => {
    const { appMeta } = client;

    return (
      <SafeViewContainer>
        <View style={styles.reviewItemsContainer}>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemTitle}>DApp</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 19, height: 19, marginEnd: 4 }} />
              <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
                {appMeta?.name}
              </Text>
            </View>
          </View>

          <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
            <Text style={styles.reviewItemTitle}>Network</Text>
            <Text style={{ ...styles.reviewItemValue, color: network?.color }} numberOfLines={1}>
              {network?.network}
            </Text>
          </View>
        </View>

        <RejectApproveButtons
          onReject={onReject}
          onApprove={onApprove}
          themeColor={network?.color}
          rejectTitle="Reject"
          approveTitle="Send"
        />
      </SafeViewContainer>
    );
  }
);
