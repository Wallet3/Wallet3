import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import JSONTree from 'react-native-json-tree';
import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { borderColor } from '../../constants/styles';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const LightJsonTheme = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED',
};

interface Props {
  themeColor: string;
  data: any;
  onReject: () => void;
  onSign: () => void;
  account?: Account;
}

export default observer(({ themeColor, data, onReject, onSign, account }: Props) => {
  const { t } = i18n;
  const { borderColor, isLightMode } = Theme;

  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 21, color: themeColor, fontWeight: '500' }}>{t('modal-message-signing')}</Text>

        {account ? <AccountIndicator account={account} /> : undefined}
      </View>

      <ScrollView style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 12 }} bounces={false}>
        <JSONTree data={data} hideRoot theme={isLightMode ? LightJsonTheme : undefined} />
      </ScrollView>

      <RejectApproveButtons
        onReject={onReject}
        onApprove={onSign}
        themeColor={themeColor}
        rejectTitle={t('button-reject')}
        approveTitle={t('button-sign')}
      />
    </SafeViewContainer>
  );
});
