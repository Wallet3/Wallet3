import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { BioType } from '../../viewmodels/Authentication';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import { PageMetadata } from '../../screens/browser/Web3View';
import { ParsedMessage } from '../../utils/siwe';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import { ScrollView } from 'react-native-gesture-handler';
import SignInWithEthereum from './SignInWithEthereum';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
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
  const { borderColor, backgroundColor, foregroundColor } = Theme;
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
      setSiwe(new ParsedMessage(msg));
    } catch (error) {
      console.log(error);
    }
  }, [msg]);

  return (
    <SafeViewContainer style={{}}>
      {siwe ? undefined : (
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
          <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-message-signing-title')}</Text>

          {account ? <AccountIndicator account={account} /> : undefined}
        </View>
      )}

      {siwe ? (
        <SignInWithEthereum rawMsg={displayMsg} account={account} metadata={metadata} siwe={siwe} />
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
        themeColor={siwe ? (siwe.domain === metadata?.origin ? themeColor : 'crimson') : themeColor}
        swipeConfirm={bioType === 'faceid'}
        rejectTitle={t('button-reject')}
        approveTitle={t(siwe ? 'button-sign-in' : 'button-sign')}
        approveIcon={siwe ? () => <FontAwesome5 name="ethereum" size={20} color="#fff" style={{ marginEnd: 2 }} /> : authIcon}
        onApprove={() => {
          setBusy(true);
          onSign?.().then(() => setBusy(false));
        }}
      />
    </SafeViewContainer>
  );
});
