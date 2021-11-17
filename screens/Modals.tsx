import { ConnectDApp, NetworksMenu, Request, Send } from '../modals';
import React, { useEffect, useState } from 'react';

import { AppVM } from '../viewmodels/App';
import { Authentication } from '../viewmodels/Authentication';
import { Dimensions } from 'react-native';
import { FullPasspad } from '../modals/views/Passpad';
import { IToken } from '../common/Tokens';
import { Modalize } from 'react-native-modalize';
import Networks from '../viewmodels/Networks';
import { autorun } from 'mobx';
import { styles } from '../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const ScreenHeight = Dimensions.get('window').height;

const WalletConnectV1 = () => {
  const { ref: connectDappRef, open: openConnectDapp, close: closeConnectDapp } = useModalize();
  const [connectUri, setConnectUri] = useState<string>();

  useEffect(() => {
    PubSub.subscribe('CodeScan', (_, { data }) => {
      setConnectUri(data);
      openConnectDapp();
    });
  }, []);

  return (
    <Modalize
      ref={connectDappRef}
      adjustToContentHeight
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      tapGestureEnabled={false}
      closeOnOverlayTap={false}
      useNativeDriver={false}
      withHandle={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <ConnectDApp uri={connectUri} close={closeConnectDapp} />
    </Modalize>
  );
};

const NetworksMenuModal = () => {
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe('openNetworksModal', () => openNetworksModal());
  }, []);

  return (
    <Modalize
      ref={networksRef}
      adjustToContentHeight
      useNativeDriver={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <NetworksMenu
        onNetworkPress={(network) => {
          closeNetworksModal();
          Networks.switch(network);
        }}
      />
    </Modalize>
  );
};

const RequestFundsModal = () => {
  const { ref: requestRef, open: openRequestModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe('openRequestModal', () => openRequestModal());
  }, []);

  return (
    <Modalize
      ref={requestRef}
      adjustToContentHeight
      useNativeDriver={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Request />
    </Modalize>
  );
};

const SendFundsModal = () => {
  const [userSelectedToken, setUserSelectedToken] = useState<IToken>();
  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe('openSendModal', (_, data) => {
      const { token } = data || {};
      setUserSelectedToken(token);
      setTimeout(() => openSendModal(), 0);
    });

    PubSub.subscribe('closeSendModal', () => closeSendModal());
  }, []);

  return (
    <Modalize
      key="SendFunds"
      ref={sendRef}
      adjustToContentHeight
      disableScrollIfPossible
      useNativeDriver={false}
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Send initToken={userSelectedToken} />
    </Modalize>
  );
};

const LockScreen = ({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { ref: lockScreenRef, open: openLockScreen, close: closeLockScreen } = useModalize();

  useEffect(() => {
    const dispose = autorun(async () => {
      if (!app.hasWallet || appAuth.appAuthorized) return;

      openLockScreen();

      if (!appAuth.biometricsEnabled || !appAuth.biometricsSupported) return;

      const success = await appAuth.authorize();
      if (success) closeLockScreen();
    });

    return () => {
      app.dispose();
      dispose();
    };
  }, []);

  return (
    <Modalize
      ref={lockScreenRef}
      modalHeight={ScreenHeight}
      closeOnOverlayTap={false}
      disableScrollIfPossible
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      modalStyle={{ borderTopStartRadius: 0, borderTopEndRadius: 0 }}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <FullPasspad
        themeColor={Networks.current.color}
        height={ScreenHeight}
        onCodeEntered={async (code) => {
          const success = await appAuth.authorize(code);
          if (success) closeLockScreen();
          return success;
        }}
      />
    </Modalize>
  );
};

export default (props: { app: AppVM; appAuth: Authentication }) => {
  return [
    <LockScreen key="lock-screen" {...props} />,
    <SendFundsModal key="send-funds" />,
    <RequestFundsModal key="request-funds" />,
    <NetworksMenuModal key="networks-menu" />,
    <WalletConnectV1 key="walletconnect" />,
  ];
};
