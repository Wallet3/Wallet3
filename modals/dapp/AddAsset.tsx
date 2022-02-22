import { Coin, SafeViewContainer } from '../../components';
import { Image, Text, View } from 'react-native';
import { InpageDAppAddAsset, InpageDAppAddEthereumChain } from '../../screens/browser/controller/InpageMetamaskDAppHub';

import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import Theme from '../../viewmodels/settings/Theme';
import { borderColor } from '../../constants/styles';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import styles from '../styles';
import { utils } from 'ethers';

interface Props extends InpageDAppAddAsset {
  themeColor: string;
  chainId: number;
}

export default ({ themeColor, approve, reject, asset, chainId }: Props) => {
  const { t } = i18n;
  const { textColor, borderColor } = Theme;

  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ paddingBottom: 5, borderBottomWidth: 0, borderBottomColor: `${borderColor}a0` }}>
        <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-dapp-add-asset-title')}</Text>
      </View>

      <View style={reviewItemsContainer}>
        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-currency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Coin
              symbol={asset.options?.symbol}
              iconUrl={Array.isArray(asset.options?.image) ? asset.options?.image[0] : asset.options?.image}
              size={19}
              chainId={chainId}
              address={asset.options?.address || ''}
              style={{ marginEnd: 4 }}
            />
            <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
              {asset.options?.symbol}
            </Text>
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-type')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {asset.type}
          </Text>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-decimals')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {asset.options.decimals}
          </Text>
        </View>

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-asset-address')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 200 }} numberOfLines={1}>
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
