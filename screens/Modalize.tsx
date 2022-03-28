import * as Linking from 'expo-linking';

import {
  AccountsMenu,
  NetworksMenu,
  Request,
  Send,
  WalletConnectDApp,
  WalletConnectSign,
  WalletConnectTxRequest,
} from '../modals';
import {
  ConnectInpageDApp,
  InpageDAppAddAsset,
  InpageDAppAddEthereumChain,
  InpageDAppSignRequest,
  InpageDAppTxRequest,
} from './browser/controller/InpageDAppController';
import { ERC681, ERC681Transferring } from '../viewmodels/transferring/ERC681Transferring';
import React, { useEffect, useState } from 'react';

import { AppVM } from '../viewmodels/App';
import { Authentication } from '../viewmodels/Authentication';
import BackupSecretTip from '../modals/BackupSecretTip';
import { FullPasspad } from '../modals/views/Passpad';
import InappBrowser from '../modals/InappBrowser';
import InpageConnectDApp from '../modals/InpageConnectDApp';
import InpageDAppAddAssetModal from '../modals/InpageDAppAddAsset';
import InpageDAppAddChain from '../modals/InpageDAppAddChain';
import InpageDAppSendTx from '../modals/InpageDAppTxRequest';
import InpageDAppSign from '../modals/InpageDAppSign';
import { Keyboard } from 'react-native';
import Loading from '../modals/views/Loading';
import MessageKeys from '../common/MessageKeys';
import { Modalize } from 'react-native-modalize';
import Networks from '../viewmodels/Networks';
import { ReactiveScreen } from '../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../viewmodels/settings/Theme';
import { TokenTransferring } from '../viewmodels/transferring/TokenTransferring';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { autorun } from 'mobx';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { parse } from 'eth-url-parser';
import { showMessage } from 'react-native-flash-message';
import { styles } from '../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { utils } from 'ethers';

const WalletConnectRequests = ({ appAuth, app }: { appAuth: Authentication; app: AppVM }) => {
  const { ref, open, close } = useModalize();
  const [type, setType] = useState<string>();
  const [client, setClient] = useState<WalletConnect_v1>();
  const [callRequest, setCallRequest] = useState<WCCallRequestRequest>();

  useEffect(() => {
    PubSub.subscribe(
      MessageKeys.wc_request,
      (_, { client, request }: { client: WalletConnect_v1; request: WCCallRequestRequest }) => {
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

        setTimeout(() => open(), 10);
      }
    );

    return () => {
      PubSub.unsubscribe(MessageKeys.wc_request);
    };
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
  const [extra, setExtra] = useState<any>();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.CodeScan_wc, (_, { data, extra }) => {
      setConnectUri(data);
      setExtra(extra);
      openConnectDapp();
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.CodeScan_wc);
    };
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
      <WalletConnectDApp uri={connectUri} close={closeConnectDapp} extra={extra} />
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

    PubSub.subscribe(MessageKeys.openConnectInpageDApp, (_, data: ConnectInpageDApp) => {
      if (data.pageMetadata) updatePageInfo(undefined, data.pageMetadata);

      setData(data);
      openConnectDapp();
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openConnectInpageDApp);
    };
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
    PubSub.subscribe(MessageKeys.openInpageDAppSign, (_, data: InpageDAppSignRequest) => {
      setSignRequest(data);
      setType('sign');
      open();
    });

    PubSub.subscribe(MessageKeys.openInpageDAppSendTransaction, (_, data: InpageDAppTxRequest) => {
      setTxRequest(data);
      setType('sendTx');
      open();
    });

    PubSub.subscribe(MessageKeys.openAddEthereumChain, (_, data: InpageDAppAddEthereumChain) => {
      setAddChain(data);
      setType('addChain');
      open();
    });

    PubSub.subscribe(MessageKeys.openAddAsset, (_, data: InpageDAppAddAsset) => {
      setAddAsset(data);
      setType('addAsset');
      open();
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openInpageDAppSign);
      PubSub.unsubscribe(MessageKeys.openInpageDAppSendTransaction);
      PubSub.unsubscribe(MessageKeys.openAddEthereumChain);
      PubSub.unsubscribe(MessageKeys.openAddAsset);
    };
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

const GlobalNetworksMenuModal = () => {
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openNetworksMenu, () => openNetworksModal());

    return () => {
      PubSub.unsubscribe(MessageKeys.openNetworksMenu);
    };
  }, []);

  return (
    <Modalize
      ref={networksRef}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      closeOnOverlayTap={!editing}
      panGestureEnabled={!editing}
      withHandle={!editing}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <NetworksMenu
        useContextMenu
        onEditing={setEditing}
        onNetworkPress={(network) => {
          closeNetworksModal();
          Networks.switch(network);
        }}
      />
    </Modalize>
  );
};

const GlobalAccountsMenuModal = () => {
  const { ref, open, close } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openAccountsMenu, () => open());

    return () => {
      PubSub.unsubscribe(MessageKeys.openAccountsMenu);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <AccountsMenu close={close} />
    </Modalize>
  );
};

const GlobalLoadingModal = () => {
  const { ref, open, close } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openLoadingModal, () => open());
    PubSub.subscribe(MessageKeys.closeLoadingModal, () => close());

    return () => {
      PubSub.unsubscribe(MessageKeys.openLoadingModal);
      PubSub.unsubscribe(MessageKeys.closeLoadingModal);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      adjustToContentHeight
      disableScrollIfPossible
      closeOnOverlayTap={false}
      withHandle={false}
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <SafeAreaProvider
        style={{
          backgroundColor: Theme.backgroundColor,
          height: 439,
          justifyContent: 'center',
          alignItems: 'center',
          borderTopRightRadius: 6,
          borderTopLeftRadius: 6,
        }}
      >
        <Loading />
      </SafeAreaProvider>
    </Modalize>
  );
};

const RequestFundsModal = () => {
  const { ref: requestRef, open: openRequestModal, close } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openRequestFundsModal, () => openRequestModal());

    return () => {
      PubSub.unsubscribe(MessageKeys.openRequestFundsModal);
    };
  }, []);

  return (
    <Modalize
      ref={requestRef}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.modalStyle}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Request close={close} />
    </Modalize>
  );
};

const SendFundsModal = () => {
  const [vm, setVM] = useState<TokenTransferring>();
  const [isERC681, setIsERC681] = useState(false);

  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openSendFundsModal, (_, data) => {
      const { token } = data || {};
      setVM(new TokenTransferring({ targetNetwork: Networks.current, defaultToken: token }));
      setTimeout(() => openSendModal(), 0);
    });

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
      PubSub.unsubscribe(MessageKeys.openSendFundsModal);
      PubSub.unsubscribe(`CodeScan-ethereum`);
      PubSub.unsubscribe(`CodeScan-0x`);
    };
  }, []);

  const clear = () => {
    vm?.dispose();
    setVM(undefined);
    setIsERC681(false);
    closeSendModal();
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

const BackupTipsModal = () => {
  const { ref, open, close } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openBackupSecretTip, () => open());

    return () => {
      PubSub.unsubscribe(MessageKeys.openBackupSecretTip);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      useNativeDriver
      closeOnOverlayTap={false}
      withHandle={false}
      adjustToContentHeight
      disableScrollIfPossible
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      scrollViewProps={{
        scrollEnabled: false,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        bounces: false,
      }}
    >
      <BackupSecretTip onDone={close} />
    </Modalize>
  );
};

export const InappBrowserModal = observer(({ pageKey }: { pageKey?: string }) => {
  const { ref, open, close } = useModalize();
  const [props, setProps] = useState<{ initUrl: string }>();
  const { height, width } = ReactiveScreen;

  useEffect(() => {
    PubSub.subscribe(`${MessageKeys.openInappBrowser}_${pageKey || ''}`, (_, data) => {
      setProps(data);
      setTimeout(() => open(), 10);
    });

    return () => {
      PubSub.unsubscribe(`${MessageKeys.openInappBrowser}_${pageKey || ''}`);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      useNativeDriver
      closeOnOverlayTap={false}
      withHandle={false}
      modalHeight={height}
      disableScrollIfPossible
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      scrollViewProps={{
        scrollEnabled: false,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        bounces: false,
      }}
    >
      {props ? (
        <SafeAreaProvider style={{ width, height }}>
          <InappBrowser
            {...props}
            onClose={() => {
              close();
              setProps(undefined);
            }}
          />
        </SafeAreaProvider>
      ) : undefined}
    </Modalize>
  );
});

export const LockScreen = observer(({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { ref: lockScreenRef, open: openLockScreen, close: closeLockScreen } = useModalize();

  const bioAuth = async () => {
    if (!appAuth.biometricEnabled || !appAuth.biometricSupported) return;

    const success = await appAuth.authorize();
    if (success) closeLockScreen();
  };

  useEffect(() => {
    const dispose = autorun(() => {
      if (!app.hasWallet || appAuth.appAuthorized) return;

      openLockScreen();
      bioAuth();
      Keyboard.dismiss();
    });

    return () => {
      dispose();
    };
  }, []);

  return (
    <Modalize
      ref={lockScreenRef}
      useNativeDriver
      modalHeight={ReactiveScreen.height}
      closeOnOverlayTap={false}
      withHandle={false}
      disableScrollIfPossible
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      modalStyle={{ borderTopStartRadius: 0, borderTopEndRadius: 0 }}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <FullPasspad
        themeColor={Theme.isLightMode ? Theme.foregroundColor : `${Theme.foregroundColor}80`}
        bioType={appAuth.biometricType}
        onBioAuth={bioAuth}
        onCodeEntered={async (code) => {
          const success = await appAuth.authorize(code);
          if (success) closeLockScreen();
          return success;
        }}
      />
    </Modalize>
  );
});

export default (props: { app: AppVM; appAuth: Authentication }) => {
  return [
    <SendFundsModal key="send-funds" />,
    <RequestFundsModal key="request-funds" />,
    <GlobalNetworksMenuModal key="networks-menu" />,
    <GlobalAccountsMenuModal key="accounts-menu" />,
    <GlobalLoadingModal key="loading-modal" />,
    <WalletConnectV1 key="walletconnect" />,
    <WalletConnectRequests key="walletconnect-requests" {...props} />,
    <InpageDAppConnect key="inpage-dapp-connect" />,
    <InpageDAppRequests key="inpage-dapp-requests" />,
    <BackupTipsModal key="backup-tip" />,
  ];
};
