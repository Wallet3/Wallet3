import ERC4337Queue, { BatchRequest } from '../../viewmodels/transferring/ERC4337Queue';
import React, { useRef, useState } from 'react';

import Authentication from '../../viewmodels/auth/Authentication';
import AwaitablePasspad from '../views/AwaitablePasspad';
import { BatchTransactionRequest } from '../../viewmodels/transferring/BatchTransactionRequest';
import BatchTxReview from './BatchTxReview';
import PendingBatchSelector from './PendingBatchSelector';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Success from '../views/Success';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  close?: () => void;
  onCritical?: (flag: boolean) => void;
}

export default observer(({ close, onCritical }: Props) => {
  const { chainQueue, chainCount, accountCount } = ERC4337Queue;

  const swiper = useRef<Swiper>(null);
  const [success, setSuccess] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const [vm, setVM] = useState<BatchTransactionRequest | undefined>(
    chainCount === 1 && accountCount === 1 ? new BatchTransactionRequest({ ...chainQueue[0].data[0] }) : undefined
  );

  const goTo = (index: number, animated?: boolean) => {
    swiper.current?.scrollTo(index, animated);
    onCritical?.(index === 1);
  };

  const send = async (pin?: string) => {
    onCritical?.(true);
    const result = await vm?.send(pin, () => setNetworkBusy(true));

    setSuccess(result?.success ?? false);
    result?.success && setTimeout(() => close?.(), 1700);

    onCritical?.(false);
    return result?.success ?? false;
  };

  const onSendPress = () => {
    if (!Authentication.biometricEnabled) {
      goTo(2);
      return;
    }

    send();
  };

  const onBatchSelected = (args: BatchRequest) => {
    try {
      if (args.account.address === vm?.account.address && args.network.chainId === vm.network.chainId) return;
      setVM(new BatchTransactionRequest(args));
    } finally {
      setTimeout(() => swiper.current?.scrollTo(1));
    }
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      {success ? (
        <Success />
      ) : (
        <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
          {(chainCount > 1 || accountCount > 1) && (
            <PendingBatchSelector vm={ERC4337Queue} onBatchSelected={onBatchSelected} />
          )}

          {vm && (
            <BatchTxReview
              vm={vm}
              onSendPress={onSendPress}
              onBack={() => goTo(0)}
              disableBack={chainCount <= 1 && accountCount <= 1}
            />
          )}

          <AwaitablePasspad
            busy={networkBusy}
            themeColor={vm?.network.color}
            onCodeEntered={send}
            onCancel={() => goTo(chainCount > 1 || accountCount > 1 ? 1 : 0)}
          />
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});
