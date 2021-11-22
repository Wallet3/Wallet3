import { ContactsPad, Passpad, ReviewPad, SendAmount } from './views';
import { ERC681, TokenTransferring } from '../viewmodels/TokenTransferring';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import Contacts from '../viewmodels/Contacts';
import { INetwork } from '../common/Networks';
import { IToken } from '../common/Tokens';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  initToken?: IToken;
  targetNetwork: INetwork;
  erc681?: ERC681;
}

export default observer(({ initToken, targetNetwork, erc681 }: Props) => {
  const [vm] = useState(new TokenTransferring({ targetNetwork, defaultToken: initToken, erc681 }));
  const [verified, setVerified] = useState(false);
  const swiper = useRef<Swiper>(null);

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const sendTx = async (pin?: string) => {
    const { success } = await App.currentWallet!.sendTx({
      accountIndex: vm.account.index,
      tx: vm.txRequest,
      pin,

      readableInfo: {
        type: 'transfer',
        symbol: vm.token.symbol,
        decimals: vm.token.decimals,
        amountWei: vm.amountWei.toString(),
        amount: Number(vm.amount).toLocaleString(undefined, { maximumFractionDigits: 7 }),
        recipient: vm.to || vm.toAddress,
      },
    });

    setVerified(success);

    if (success) setTimeout(() => PubSub.publish('closeSendFundsModal'), 1700);

    return success;
  };

  const onSendClick = async () => {
    Contacts.saveContact({ address: vm.toAddress, ens: vm.isEns ? vm.to : undefined });

    if (!Authentication.biometricsEnabled) {
      swiper.current?.scrollTo(3);
      return;
    }

    if (await sendTx()) return;
    swiper.current?.scrollTo(3);
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {verified ? (
        <Success />
      ) : (
        <Swiper
          ref={swiper}
          showsPagination={false}
          showsButtons={false}
          scrollEnabled={false}
          loop={false}
          automaticallyAdjustContentInsets
        >
          <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} vm={vm} />
          <SendAmount
            vm={vm}
            onBack={() => swiper.current?.scrollTo(0)}
            onNext={() => {
              swiper.current?.scrollTo(2);
              vm.estimateGas();
            }}
          />
          <ReviewPad onBack={() => swiper.current?.scrollTo(1)} vm={vm} onSend={onSendClick} />
          <Passpad
            themeColor={vm.network.color}
            onCodeEntered={(c) => sendTx(c)}
            onCancel={() => swiper.current?.scrollTo(2)}
          />
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});
