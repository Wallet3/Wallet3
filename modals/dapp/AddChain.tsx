import { Image, Text, View } from 'react-native';

import { InpageDAppAddEthereumChain } from '../../screens/browser/controller/InpageDAppController';
import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { borderColor } from '../../constants/styles';
import i18n from '../../i18n';
import styles from '../styles';

interface Props extends InpageDAppAddEthereumChain {
  themeColor: string;
}

export default ({ themeColor, chain, approve, reject }: Props) => {
  const { t } = i18n;
  const { textColor, borderColor } = Theme;

  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ paddingBottom: 2 }}>
        <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-dapp-add-new-network-title')}</Text>
      </View>

      <View style={reviewItemsContainer}>
        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-network')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: chain.iconUrls?.[0] }} style={{ width: 19, height: 19, marginEnd: 4 }} />
            <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
              {chain.chainName}
            </Text>
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-chainid')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {Number(chain.chainId)}
          </Text>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-currency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
              {chain.nativeCurrency?.symbol}
            </Text>
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>RPC URL</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {chain.rpcUrls?.[0] || chain.rpcUrls?.toString()}
          </Text>
        </View>

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-add-new-network-explorer')}</Text>
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {chain.blockExplorerUrls?.[0]}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <RejectApproveButtons
        disabledApprove={!chain?.rpcUrls?.[0]}
        onReject={reject}
        onApprove={approve}
        themeColor={themeColor}
        rejectTitle={t('button-reject')}
        approveTitle={t('button-save')}
      />
    </SafeViewContainer>
  );
};
