import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { borderColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import Avatar from '../../components/Avatar';
import { BioType } from '../../viewmodels/Authentication';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { WCCallRequestRequest } from '../../models/WCSession_v1';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  msg: string | Uint8Array;
  themeColor: string;
  onReject?: () => void;
  onSign?: () => Promise<void>;
  account?: Account;
  bioType?: BioType;
}

export default observer(({ msg, themeColor, onReject, onSign, account, bioType }: Props) => {
  const { t } = i18n;
  const { borderColor } = Theme;
  const [busy, setBusy] = useState(false);
  const authIcon = bioType
    ? bioType === 'faceid'
      ? () => <FaceID width={12.5} height={12.5} style={{ marginEnd: 2 }} />
      : () => <MaterialCommunityIcons name="fingerprint" size={19} color="#fff" />
    : undefined;

  return (
    <SafeViewContainer style={{}}>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-message-signing')}</Text>

        {account ? <AccountIndicator account={account} /> : undefined}
      </View>

      <ScrollView
        style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        <Text style={{ color: thirdFontColor }}>{msg}</Text>
      </ScrollView>

      <RejectApproveButtons
        disabledApprove={busy}
        onReject={onReject}
        themeColor={themeColor}
        swipeConfirm={bioType === 'faceid'}
        rejectTitle={t('button-reject')}
        approveTitle={t('button-sign')}
        approveIcon={authIcon}
        onApprove={() => {
          setBusy(true);
          onSign?.().then(() => setBusy(false));
        }}
      />
    </SafeViewContainer>
  );
});
