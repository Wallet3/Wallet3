import { Button, Coin, Placeholder, SafeViewContainer } from '../../components';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import { BatchTransactionRequest } from '../../viewmodels/transferring/BatchTransactionRequest';
import BioAuthSendButton from '../components/BioAuthSendButton';
import GasFeeReviewItem from '../components/GasFeeReviewItem';
import GasReview from '../views/GasReview';
import { Ionicons } from '@expo/vector-icons';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { warningColor } from '../../constants/styles';

interface Props {
  disableBack?: boolean;
  onBack?: () => void;
  vm: BatchTransactionRequest;
}

const BatchTxReview = observer(({ disableBack, onBack, vm }: Props) => {
  const { t } = i18n;
  const { borderColor } = Theme;

  const renderTx = ({ item, index }: { item: SendTxRequest; index: number }) => {
    const { tx, readableInfo } = item;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderColor,
        }}
      >
        <Text style={styles.reviewItemTitle}>{index + 1}. </Text>
        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {readableInfo?.['symbol'] && (
            <Coin
              address={tx!.to!}
              size={18}
              chainId={vm.network.chainId}
              symbol={readableInfo['symbol']}
              style={{ marginHorizontal: 8 }}
            />
          )}
          <Text numberOfLines={1} style={[styles.reviewItemTitle]}>
            {readableInfo?.readableTxt}
          </Text>
        </ScrollView>
        <Placeholder />
        <TouchableOpacity style={{ padding: 8, marginVertical: -8, marginStart: 0 }}>
          <Ionicons name="trash-outline" color={warningColor} size={15} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        {disableBack ? <View /> : <BackButton onPress={onBack} color={vm.network.color} />}

        <Text style={styles.navTitle}>{t('modal-review-title')}</Text>
      </View>

      <FlatList
        data={vm.txs}
        bounces={false}
        renderItem={renderTx}
        style={[styles.reviewItemsContainer, { overflow: 'hidden' }]}
        contentContainerStyle={{ overflow: 'hidden' }}
      />

      <GasFeeReviewItem vm={vm} />

      <View style={{ height: 64 }} />

      <BioAuthSendButton onPress={vm.send} themeColor={vm.network.color} />
    </SafeViewContainer>
  );
});

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <BatchTxReview {...props} />
      <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={props.vm} themeColor={props.vm.network.color} />
    </Swiper>
  );
});
