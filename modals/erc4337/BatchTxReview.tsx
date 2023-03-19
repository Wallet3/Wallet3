import { Button, Placeholder, SafeViewContainer } from '../../components';
import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import { BatchTransactionRequest } from '../../viewmodels/transferring/BatchTransactionRequest';
import BioAuthSendButton from '../components/BioAuthSendButton';
import { FlatList } from 'react-native-gesture-handler';
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
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor,
        }}
      >
        <Text>{index + 1}.</Text>
        <Text>{readableInfo?.type}</Text>
        <Placeholder />
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="trash-bin" color={warningColor} />
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

      <View style={{ height: 52 }} />

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
