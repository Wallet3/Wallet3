import { Button, SafeViewContainer } from '../../components';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { BioType } from '../../viewmodels/Authentication';
import Collapsible from 'react-native-collapsible';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import JSONTree from 'react-native-json-tree';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import Themes from '../../screens/settings/Themes';
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
  onSign: () => Promise<void>;
  account?: Account;
  bioType?: BioType;
}

const parse = (obj: any) => {
  if (!obj) return undefined;

  const keys = Object.getOwnPropertyNames(obj).filter((key) => !(Array.isArray(obj) && key === 'length'));
  const result: { key: string; value: any | any[] }[] = [];

  for (let key of keys) {
    const value = obj[key];

    if (typeof value === 'object') {
      result.push({ key, value: parse(value) });
    } else {
      result.push({ key, value });
    }
  }

  return result;
};

const generateCollapsibleItem = ({ item }: { item: { key: string; value: any[] } }) => {
  const [collapsed, setCollapsed] = useState(true);
  const { textColor } = Theme;

  return (
    <View key={item.key}>
      <TouchableOpacity
        style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, alignItems: 'center' }}
        onPress={() => setCollapsed(!collapsed)}
      >
        <Text style={{ fontWeight: '500', paddingEnd: 24, fontSize: 16, color: textColor }} numberOfLines={1}>
          {item.key}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: textColor }} numberOfLines={1}>{`Items: ${item.value.length}`}</Text>
          <Entypo
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            color={textColor}
            style={{ paddingStart: 4, opacity: 0.75 }}
          />
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={collapsed} style={{ paddingStart: 12 }}>
        {generateItem({ data: item.value })}
      </Collapsible>
    </View>
  );
};

const generateItem = ({ data }: { data: { key: string; value: any | any[] }[] }) => {
  if (!data) return null;

  const { textColor } = Theme;

  return data.map((item: { key: string; value: any | any[] }) => {
    if (Array.isArray(item.value)) {
      return generateCollapsibleItem({ item });
    } else {
      return (
        <View
          key={item.key}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 4,
            maxWidth: '100%',
            alignItems: 'flex-start',
          }}
        >
          <Text style={{ fontWeight: '500', paddingEnd: 16, fontSize: 16, color: textColor }} numberOfLines={1}>
            {item.key}
          </Text>
          <Text style={{ color: textColor, fontSize: 14 }}>{item.value}</Text>
        </View>
      );
    }
  });
};

export default observer(({ themeColor, data, onReject, onSign, account, bioType }: Props) => {
  const { t } = i18n;
  const { borderColor, isLightMode, thirdTextColor } = Theme;
  const [busy, setBusy] = useState(false);
  const authIcon = bioType
    ? bioType === 'faceid'
      ? () => <FaceID width={12.5} height={12.5} style={{ marginEnd: 2 }} />
      : () => <MaterialCommunityIcons name="fingerprint" size={19} color="#fff" />
    : undefined;

  console.log('parse:\n', parse(data.message));

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
        {/* <JSONTree data={data} hideRoot theme={isLightMode ? LightJsonTheme : undefined} /> */}
        {generateItem({ data: parse(data.message)! })}
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
