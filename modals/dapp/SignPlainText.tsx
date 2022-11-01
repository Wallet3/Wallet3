import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { BioType } from '../../viewmodels/auth/Authentication';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import { ParsedMessage } from '../../utils/siwe_plain';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import SignInWithEthereum from './SignInWithEthereum';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { thirdFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  msg: string | Uint8Array;
  themeColor: string;
  onReject?: () => void;
  onSign?: () => Promise<void>;
  account?: Account;
  bioType?: BioType;
  onStandardModeOn: (on: boolean) => void;
  metadata?: { origin: string; icon: string; title: string };
}

export default observer(({ msg, themeColor, onReject, onSign, account, bioType, onStandardModeOn, metadata }: Props) => {
  const { t } = i18n;
  const { borderColor } = Theme;
  const [busy, setBusy] = useState(false);
  const [isByte] = useState(utils.isBytes(msg));
  const [displayMsg] = useState(isByte ? utils.hexlify(msg) : (msg as string));
  const [standardMode, setStandardMode] = useState(false);
  const [siwe, setSiwe] = useState<ParsedMessage>();
  const authIcon = bioType
    ? bioType === 'faceid'
      ? () => <FaceID width={12.5} height={12.5} style={{ marginEnd: 2 }} />
      : () => <MaterialCommunityIcons name="fingerprint" size={19} color="#fff" />
    : undefined;

  useEffect(() => {
    if (typeof msg !== 'string') {
      setSiwe(undefined);
      return;
    }

    if (msg.startsWith('0x')) {
      setSiwe(undefined);
      return;
    }

    try {
      setSiwe(new ParsedMessage(msg, metadata?.origin!));
    } catch (error) {
      console.log(error);
    }
  }, [msg]);

  return (
    <SafeViewContainer style={{}}>
      {siwe ? undefined : (
        <View
          style={{
            ...styles.modalTitleContainer,
            borderBottomColor: borderColor,
          }}
        >
          <Text style={{ ...styles.modalTitle, color: themeColor }}>{t('modal-message-signing-title')}</Text>

          {account ? <AccountIndicator account={account} /> : undefined}
        </View>
      )}

      {siwe ? (
        <SignInWithEthereum rawMsg={displayMsg} account={account} metadata={metadata} siwe={siwe} themeColor={themeColor} />
      ) : (
        <ScrollView
          style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <Text style={{ color: thirdFontColor }}>{displayMsg}</Text>
        </ScrollView>
      )}

      {isByte ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: thirdFontColor }}>{t('modal-sign-with-stand-mode')}</Text>
          <Switch
            value={standardMode}
            trackColor={{ true: themeColor }}
            onValueChange={(v) => {
              setStandardMode(v);
              onStandardModeOn(v);
            }}
          />
        </View>
      ) : undefined}

      <RejectApproveButtons
        disabledApprove={busy}
        onReject={onReject}
        themeColor={siwe && metadata ? (siwe.isConsistent ? themeColor : 'crimson') : themeColor}
        swipeConfirm={bioType === 'faceid'}
        rejectTitle={t('button-reject')}
        approveTitle={t(siwe ? 'button-sign-in' : 'button-sign')}
        approveIcon={siwe ? () => <FontAwesome5 name="ethereum" size={18} color="#fff" style={{ marginEnd: 1 }} /> : authIcon}
        onApprove={() => {
          setBusy(true);
          onSign?.().then(() => setBusy(false));
        }}
      />
    </SafeViewContainer>
  );
});
