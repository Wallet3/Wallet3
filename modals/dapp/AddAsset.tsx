import { Image, Text, View } from 'react-native';
import { InpageDAppAddAsset, InpageDAppAddEthereumChain } from '../../viewmodels/hubs/InpageDAppHub';

import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import { borderColor } from '../../constants/styles';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import styles from '../styles';
import { utils } from 'ethers';

interface Props extends InpageDAppAddAsset {
  themeColor: string;
}

export default ({ themeColor, approve, reject, asset }: Props) => {
  const { t } = i18n;

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ paddingBottom: 5, borderBottomWidth: 0, borderBottomColor: `${borderColor}a0` }}>
        <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-dapp-add-asset-title')}</Text>
      </View>

      <View style={styles.reviewItemsContainer}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-currency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: asset.options?.image }} style={{ width: 19, height: 19, marginEnd: 4 }} />
            <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
              {asset.options?.symbol}
            </Text>
          </View>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-type')}</Text>
          <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
            {asset.type}
          </Text>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-decimals')}</Text>
          <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
            {asset.options.decimals}
          </Text>
        </View>

        <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-address')}</Text>
          <Text style={{ ...styles.reviewItemValue, maxWidth: 200 }} numberOfLines={1}>
            {formatAddress(utils.getAddress(asset.options.address), 7, 5)}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <RejectApproveButtons
        onReject={reject}
        onApprove={approve}
        themeColor={themeColor}
        rejectTitle={t('button-cancel')}
        approveTitle={t('button-save')}
      />
    </SafeViewContainer>
  );
};
