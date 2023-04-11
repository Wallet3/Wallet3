import { BigNumber, utils } from 'ethers';
import { Button, Coin, Placeholder, SafeViewContainer } from '../../components';
import { FadeInDownView, FadeInRightView } from '../../components/animations';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import { BatchTransactionRequest } from '../../viewmodels/transferring/BatchTransactionRequest';
import BioAuthSendButton from '../components/BioAuthSendButton';
import GasFeeReviewItem from '../components/GasFeeReviewItem';
import GasReview from '../views/GasReview';
import Image from 'react-native-fast-image';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import TxException from '../components/TxException';
import { formatCurrency } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import styles from '../styles';
import { warningColor } from '../../constants/styles';

interface Props {
  disableBack?: boolean;
  onBack?: () => void;
  onSendPress?: () => void;
  vm: BatchTransactionRequest;
  onGasReview?: () => void;
}

const BatchTxReview = observer(({ disableBack, onBack, vm, onGasReview, onSendPress }: Props) => {
  const { t } = i18n;
  const { borderColor } = Theme;
  const { network } = vm;

  const renderTx = ({ item, index }: { item: SendTxRequest; index: number }) => {
    const { tx, readableInfo } = item;

    return (
      <FadeInDownView
        delay={index * 50}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingEnd: 8,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderColor,
        }}
      >
        <Text style={[styles.reviewItemTitle, { minWidth: 20 }]}>{index + 1}. </Text>
        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {readableInfo?.icon ? (
            <Image
              source={{ uri: readableInfo.icon }}
              style={{ width: 19, height: 19, marginStart: 5, marginEnd: 8, borderRadius: 3 }}
            />
          ) : (
            readableInfo?.['symbol'] && (
              <Coin
                address={tx!.to!}
                size={18}
                chainId={vm.network.chainId}
                symbol={readableInfo['symbol']}
                style={{ marginStart: 5, marginEnd: 8 }}
              />
            )
          )}

          <Text numberOfLines={1} style={[styles.reviewItemTitle]}>
            {readableInfo?.readableTxt || `${readableInfo?.dapp} ${readableInfo?.decodedFunc}`}
          </Text>

          {BigNumber.from(item.tx?.value ?? 0).gt(0) && (tx?.data?.length ?? 0) >= 10 && (
            <Text numberOfLines={1} style={[styles.reviewItemTitle, { marginStart: 8 }]}>
              {`${-formatCurrency(utils.formatEther(item.tx?.value ?? 0), '', '0.0000')} ${network.symbol}`}
            </Text>
          )}
        </ScrollView>
        <Placeholder />
        <TouchableOpacity
          style={{ padding: 8, marginVertical: -8, marginStart: 4 }}
          onPress={() => {
            vm.removeRequest(item);
            startLayoutAnimation();
          }}
        >
          <Ionicons name="trash-outline" color={warningColor} size={17} />
        </TouchableOpacity>
      </FadeInDownView>
    );
  };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        {disableBack ? <View style={{ height: 33 }} /> : <BackButton onPress={onBack} color={vm.network.color} />}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="dropbox" color={network.color} size={20} style={{ marginEnd: 10 }} />
          <Text style={[styles.navTitle, { color: network.color }]}>{t('modal-review-title')}</Text>
        </View>
      </View>

      <FlatList
        data={vm.requests}
        bounces={false}
        renderItem={renderTx}
        keyExtractor={(t) => `${t.network?.chainId}-${t.tx?.from}-${t.timestamp}`}
        style={[styles.reviewItemsContainer, { overflow: 'hidden' }]}
        contentContainerStyle={{ overflow: 'hidden' }}
      />

      <GasFeeReviewItem vm={vm} onGasPress={onGasReview} />

      {vm.txException && <TxException exception={vm.txException} containerStyle={{ marginTop: 10 }} />}

      <View style={{ maxHeight: 64, minHeight: 12, flex: 1 }} />

      <BioAuthSendButton
        onPress={onSendPress}
        themeColor={vm.network.color}
        disabled={vm.requests.length === 0 || vm.invalidParams}
      />
    </SafeViewContainer>
  );
});

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <BatchTxReview {...props} onGasReview={() => swiper.current?.scrollTo(1)} />
      <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={props.vm} themeColor={props.vm.network.color} />
    </Swiper>
  );
});
