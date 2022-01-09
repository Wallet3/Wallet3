import * as Linking from 'expo-linking';

import {
  ConnectInpageDApp,
  InpageDAppAddAsset,
  InpageDAppAddEthereumChain,
  InpageDAppSignRequest,
  InpageDAppTxRequest,
} from '../viewmodels/hubs/InpageDAppHub';
import { ERC681, ERC681Transferring } from '../viewmodels/transferring/ERC681Transferring';
import { NetworksMenu, Request, Send, WalletConnectDApp, WalletConnectSign, WalletConnectTxRequest } from '../modals';
import React, { useEffect, useState } from 'react';

import { AppVM } from '../viewmodels/App';
import { Authentication } from '../viewmodels/Authentication';
import { Dimensions } from 'react-native';
import { FullPasspad } from '../modals/views/Passpad';
import InpageConnectDApp from '../modals/InpageConnectDApp';
import InpageDAppAddAssetModal from '../modals/InpageDAppAddAsset';
import InpageDAppAddChain from '../modals/InpageDAppAddChain';
import InpageDAppSendTx from '../modals/InpageDAppTxRequest';
import InpageDAppSign from '../modals/InpageDAppSign';
import { Modalize } from 'react-native-modalize';
import Networks from '../viewmodels/Networks';
import { TokenTransferring } from '../viewmodels/transferring/TokenTransferring';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { autorun } from 'mobx';
import i18n from '../i18n';
import { parse } from 'eth-url-parser';
import { showMessage } from 'react-native-flash-message';
import { styles } from '../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { utils } from 'ethers';

const ScreenHeight = Dimensions.get('window').height;

const WalletConnectRequests = ({ appAuth, app }: { appAuth: Authentication; app: AppVM }) => {
  const { ref, open, close } = useModalize();
  const [type, setType] = useState<string>();
  const [client, setClient] = useState<WalletConnect_v1>();
  const [callRequest, setCallRequest] = useState<WCCallRequestRequest>();

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
      withHandle={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      {type === 'sign' ? <WalletConnectSign client={client!} request={callRequest!} close={close} /> : undefined}

      {type === 'sendTx' ? <WalletConnectTxRequest client={client!} request={callRequest!} close={close} /> : undefined}
    </Modalize>
  );
};

const WalletConnectV1 = () => {
  const { ref: connectDappRef, open: openConnectDapp, close: closeConnectDapp } = useModalize();
  const [connectUri, setConnectUri] = useState<string>();

  useEffect(() => {
    PubSub.subscribe('CodeScan-wc:', (_, { data }) => {
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
      withHandle={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <WalletConnectDApp uri={connectUri} close={closeConnectDapp} />
    </Modalize>
  );
};

const InpageDAppConnect = () => {
  const { ref: connectDappRef, open: openConnectDapp, close: closeModal } = useModalize();
  const [info, setInfo] = useState<any>({});
  const [data, setData] = useState<ConnectInpageDApp>();

  const close = () => {
    setInfo({});
    closeModal();
  };

  useEffect(() => {
    const updatePageInfo = (_, payload: any) => {
      const { scheme, hostname } = Linking.parse(payload.origin);

      setInfo({
        appUrl: `${scheme}://${hostname}`,
        appName: payload.title,
        appIcon: payload.icon,
        appDesc: payload.desc,
      });
    };

    PubSub.subscribe('openConnectInpageDApp', (_, data: ConnectInpageDApp) => {
      if (data.pageMetadata) updatePageInfo(undefined, data.pageMetadata);

      setData(data);
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
      withHandle={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <InpageConnectDApp {...info} close={close} approve={data?.approve} reject={data?.reject} />
    </Modalize>
  );
};

const InpageDAppRequests = () => {
  const { ref, open, close } = useModalize();
  const [signRequest, setSignRequest] = useState<InpageDAppSignRequest>();
  const [txRequest, setTxRequest] = useState<InpageDAppTxRequest>();
  const [addChain, setAddChain] = useState<InpageDAppAddEthereumChain>();
  const [addAsset, setAddAsset] = useState<InpageDAppAddAsset>();
  const [type, setType] = useState('');

  useEffect(() => {
    PubSub.subscribe('openInpageDAppSign', (_, data: InpageDAppSignRequest) => {
      setSignRequest(data);
      setType('sign');
      open();
    });

    PubSub.subscribe('openInpageDAppSendTransaction', (_, data: InpageDAppTxRequest) => {
      setTxRequest(data);
      setType('sendTx');
      open();
    });

    PubSub.subscribe('openAddEthereumChain', (_, data: InpageDAppAddEthereumChain) => {
      setAddChain(data);
      setType('addChain');
      open();
    });

    PubSub.subscribe('openAddAsset', (_, data: InpageDAppAddAsset) => {
      setAddAsset(data);
      setType('addAsset');
      open();
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
      withHandle={false}
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      {type === 'sign' ? <InpageDAppSign {...signRequest!} close={close} /> : undefined}
      {type === 'sendTx' ? <InpageDAppSendTx {...txRequest!} close={close} /> : undefined}
      {type === 'addChain' ? <InpageDAppAddChain {...addChain!} close={close} /> : undefined}
      {type === 'addAsset' ? <InpageDAppAddAssetModal {...addAsset!} close={close} /> : undefined}
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
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Request />
    </Modalize>
  );
};

const SendFundsModal = () => {
  const [vm, setVM] = useState<TokenTransferring>();
  const [isERC681, setIsERC681] = useState(false);

  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe('openSendFundsModal', (_, data) => {
      const { token } = data || {};
      setVM(new TokenTransferring({ targetNetwork: Networks.current, defaultToken: token }));
      setTimeout(() => openSendModal(), 0);
    });

    PubSub.subscribe('closeSendFundsModal', () => closeSendModal());

    PubSub.subscribe(`CodeScan-ethereum`, (_, { data }) => {
      try {
        const erc681 = parse(data) as ERC681;
        setIsERC681(erc681.parameters?.amount || erc681.parameters?.value || erc681.function_name ? true : false);
        setVM(new ERC681Transferring({ defaultNetwork: Networks.current, erc681 }));
        setTimeout(() => openSendModal(), 0);
      } catch (error) {
        showMessage({ message: (error as any)?.toString?.(), type: 'warning' });
      }
    });

    PubSub.subscribe(`CodeScan-0x`, (_, { data }) => {
      if (!utils.isAddress(data) && !data.endsWith('.eth')) {
        showMessage({ message: i18n.t('msg-invalid-address'), type: 'warning' });
        return;
      }

      setIsERC681(false);
      setVM(new TokenTransferring({ targetNetwork: Networks.current, to: data }));
      setTimeout(() => openSendModal(), 0);
    });

    return () => {
      PubSub.unsubscribe('openSendFundsModal');
      PubSub.unsubscribe('closeSendFundsModal');
    };
  }, []);

  const clear = () => {
    vm?.dispose();
    setVM(undefined);
    setIsERC681(false);
  };

  return (
    <Modalize
      key="SendFunds"
      ref={sendRef}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      {vm ? <Send vm={vm} onClose={clear} erc681={isERC681} /> : undefined}
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
    <InpageDAppConnect key="inpage-dapp-connect" />,
    <InpageDAppRequests key="inpage-dapp-requests" />,
  ];
};
