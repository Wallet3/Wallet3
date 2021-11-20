import { ConnectDApp, DAppTxRequest, NetworksMenu, Request, Send, Sign } from '../modals';
import { Dimensions, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../models/WCSession_v1';

import { AppVM } from '../viewmodels/App';
import { Authentication } from '../viewmodels/Authentication';
import { FullPasspad } from '../modals/views/Passpad';
import { IToken } from '../common/Tokens';
import { Modalize } from 'react-native-modalize';
import Networks from '../viewmodels/Networks';
import { PublicNetworks } from '../common/Networks';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { autorun } from 'mobx';
import { styles } from '../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const ScreenHeight = Dimensions.get('window').height;

const WalletConnectRequests = ({ appAuth, app }: { appAuth: Authentication; app: AppVM }) => {
  const { ref, open, close } = useModalize();
  const [type, setType] = useState<string>();
  const [client, setClient] = useState<WalletConnect_v1>();
  const [callRequest, setCallRequest] = useState<WCCallRequestRequest>();
  const { current } = Networks;

  useEffect(() => {
    PubSub.subscribe('wc_request', (_, { client, request }: { client: WalletConnect_v1; request: WCCallRequestRequest }) => {
      if (!appAuth.appAuthorized) {
        client.rejectRequest(request.id, 'Unauthorized');
        return;
      }

      setType(undefined);
      setCallRequest(undefined);
      setClient(client);

      switch (request.method) {
        case 'eth_sign':
        case 'personal_sign':
        case 'eth_signTypedData':
          setCallRequest(request);
          setType('sign');
          break;
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
          setCallRequest(request);
          setType('sendTx');
          break;
      }

      setTimeout(() => open(), 0);
    });
  }, []);

  return (
    <Modalize
      ref={ref}
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
      {type === 'sign' ? (
        <Sign
          client={client!}
          request={callRequest!}
          themeColor={current.color}
          close={close}
          wallet={app.currentWallet!}
          appAuth={appAuth}
        />
      ) : undefined}

      {type === 'sendTx' ? <DAppTxRequest client={client!} request={callRequest!} close={close} /> : undefined}
    </Modalize>
  );
};

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
    PubSub.subscribe('openRequestFundsModal', () => openRequestModal());
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
    PubSub.subscribe('openSendFundsModal', (_, data) => {
      const { token } = data || {};
      setUserSelectedToken(token);
      setTimeout(() => openSendModal(), 0);
    });

    PubSub.subscribe('closeSendFundsModal', () => closeSendModal());

    return () => {
      PubSub.unsubscribe('openSendFundsModal');
      PubSub.unsubscribe('closeSendFundsModal');
    };
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
    <WalletConnectRequests key="walletconnect-requests" {...props} />,
  ];
};
