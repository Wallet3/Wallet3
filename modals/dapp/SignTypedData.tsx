import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { BioType } from '../../viewmodels/Authentication';
import Collapsible from 'react-native-collapsible';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import RejectApproveButtons from '../components/RejectApproveButtons';
import { SafeViewContainer } from '../../components';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

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
  const { textColor, thirdTextColor } = Theme;
  const { t } = i18n;

  if (!item) return null;

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
          <Text style={{ fontSize: 12, color: thirdTextColor, opacity: 0.5 }} numberOfLines={1}>
            {t('modal-sign-typed-msg-items', { count: item.value.length })}
          </Text>
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
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontWeight: '500', paddingEnd: 16, fontSize: 16, color: textColor }} numberOfLines={1}>
            {item.key}
          </Text>
          <Text style={{ color: textColor, fontSize: 14, marginTop: 2.25, maxWidth: '80%' }}>{item.value}</Text>
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

      <ScrollView style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }} bounces={false}>
        {data?.message ? generateItem({ data: parse(data.message)! }) : generateItem({ data: parse(data)! })}
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
