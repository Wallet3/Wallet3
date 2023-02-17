import * as Linking from 'expo-linking';

import {
  AccountsMenu,
  NetworksMenu,
  QRScan,
  Request,
  Send,
  WalletConnectDApp,
  WalletConnectSign,
  WalletConnectTxRequest,
} from '../modals';
import AppAuth, { Authentication } from '../viewmodels/auth/Authentication';
import {
  ConnectInpageDApp,
  InpageDAppAddAsset,
  InpageDAppAddEthereumChain,
  InpageDAppSignRequest,
  InpageDAppTxRequest,
} from './browser/controller/InpageDAppController';
import { ERC681, ERC681Transferring } from '../viewmodels/transferring/ERC681Transferring';
import React, { useEffect, useState } from 'react';
import { ShardReceiverUI, ShardsDistributorUI } from '../modals/tss';

import { AppVM } from '../viewmodels/core/App';
import BackupSecretTip from '../modals/misc/BackupSecretTip';
import { FullPasspad } from '../modals/views/Passpad';
import GlobalPasspad from '../modals/global/GlobalPasspad';
import InappBrowser from '../modals/app/InappBrowser';
import InpageConnectDApp from '../modals/inpage/InpageConnectDApp';
import InpageDAppAddAssetModal from '../modals/inpage/InpageDAppAddAsset';
import InpageDAppAddChain from '../modals/inpage/InpageDAppAddChain';
import InpageDAppSendTx from '../modals/inpage/InpageDAppTxRequest';
import InpageDAppSign from '../modals/inpage/InpageDAppSign';
import { Keyboard } from 'react-native';
import Loading from '../modals/views/Loading';
import MessageKeys from '../common/MessageKeys';
import { Modalize } from 'react-native-modalize';
import Networks from '../viewmodels/core/Networks';
import { ReactiveScreen } from '../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShardReceiver } from '../viewmodels/tss/ShardReceiver';
import { ShardsDistributor } from '../viewmodels/tss/ShardsDistributor';
import Theme from '../viewmodels/settings/Theme';
import { TokenTransferring } from '../viewmodels/transferring/TokenTransferring';
import { WCCallRequestRequest } from '../models/entities/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../viewmodels/walletconnect/WalletConnect_v2';
import { autorun } from 'mobx';
import i18n from '../i18n';
import { isDomain } from '../viewmodels/services/DomainResolver';
import { logScreenView } from '../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';
import { parse } from 'eth-url-parser';
import { randomBytes } from 'crypto';
import { showMessage } from 'react-native-flash-message';
import styles from '../modals/styles';
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
      (_, { client, request, chainId }: { client: WalletConnect_v1; request: WCCallRequestRequest; chainId?: number }) => {
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
          case 'eth_signTypedData_v3':
          case 'eth_signTypedData_v4':
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
      modalStyle={styles.containerTopBorderRadius}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      {type === 'sign' ? <WalletConnectSign client={client!} request={callRequest!} close={close} /> : undefined}

      {type === 'sendTx' ? <WalletConnectTxRequest client={client!} request={callRequest!} close={close} /> : undefined}
    </Modalize>
  );
};

const WalletConnect = () => {
  const { ref: connectDappRef, open: openConnectDapp, close: closeConnectDapp } = useModalize();
  const [state, setState] = useState<{ uri?: string; extra?: any; client_v2?: WalletConnect_v2 }>({
    uri: undefined,
    extra: undefined,
    client_v2: undefined,
  });

  useEffect(() => {
    PubSub.subscribe(MessageKeys.codeScan.walletconnect, (_, { data, extra }) => {
      setState({ uri: data, extra });
      openConnectDapp();
    });

    PubSub.subscribe(MessageKeys.walletconnect.pairing_request, (_, { client }) => {
      setState({ client_v2: client });
      openConnectDapp();
    });

    PubSub.subscribe(MessageKeys.walletconnect.notSupportedSessionProposal, () => {
      closeConnectDapp();
      setState({});
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.codeScan.walletconnect);
      PubSub.unsubscribe(MessageKeys.walletconnect.notSupportedSessionProposal);
      PubSub.unsubscribe(MessageKeys.walletconnect.pairing_request);
      setState({});
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
      modalStyle={styles.containerTopBorderRadius}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <WalletConnectDApp uri={state.uri} close={closeConnectDapp} extra={state.extra} directClient={state.client_v2} />
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
      modalStyle={styles.containerTopBorderRadius}
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
      modalStyle={styles.containerTopBorderRadius}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      {type === 'sign' ? <InpageDAppSign {...signRequest!} close={close} /> : undefined}
      {type === 'sendTx' ? <InpageDAppSendTx {...txRequest!} close={close} /> : undefined}
      {type === 'addChain' ? <InpageDAppAddChain {...addChain!} close={close} /> : undefined}
      {type === 'addAsset' ? <InpageDAppAddAssetModal {...addAsset!} close={close} /> : undefined}
    </Modalize>
  );
};

const GlobalNetworksMenuModal = observer(() => {
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openNetworksMenu, () => {
      openNetworksModal();
      logScreenView('GlobalNetworksMenu');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openNetworksMenu);
    };
  }, []);

  return (
    <Modalize
      ref={networksRef}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.containerTopBorderRadius}
      closeOnOverlayTap={!editing}
      panGestureEnabled={!editing}
      withHandle={!editing}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <NetworksMenu
        useContextMenu
        onEditing={setEditing}
        selectedNetwork={Networks.current}
        onNetworkPress={(network) => {
          closeNetworksModal();
          Networks.switch(network);
        }}
      />
    </Modalize>
  );
});

const GlobalAccountsMenuModal = () => {
  const { ref, open, close } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openAccountsMenu, () => {
      open();
      logScreenView('GlobalAccountsMenu');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openAccountsMenu);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.containerTopBorderRadius}
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
      modalStyle={styles.containerTopBorderRadius}
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
    PubSub.subscribe(MessageKeys.openRequestFundsModal, () => {
      openRequestModal();
      logScreenView('RequestsFundsModal');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openRequestFundsModal);
    };
  }, []);

  return (
    <Modalize
      ref={requestRef}
      adjustToContentHeight
      disableScrollIfPossible
      modalStyle={styles.containerTopBorderRadius}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Request close={close} />
    </Modalize>
  );
};

const SendFundsModal = () => {
  const [vm, setVM] = useState<TokenTransferring>();
  const [isERC681, setIsERC681] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openSendFundsModal, (_, data) => {
      const { token } = data || {};
      setVM(new TokenTransferring({ targetNetwork: Networks.current, defaultToken: token }));
      setTimeout(() => openSendModal(), 0);
      logScreenView('SendFundsModal');
    });

    PubSub.subscribe(MessageKeys.codeScan.ethereum, (_, { data }) => {
      try {
        const erc681 = parse(data) as ERC681;
        setIsERC681(erc681.parameters?.amount || erc681.parameters?.value || erc681.function_name ? true : false);
        setVM(new ERC681Transferring({ defaultNetwork: Networks.current, erc681 }));
        setTimeout(() => openSendModal(), 0);
        logScreenView('SendFundsModal_QR');
      } catch (error) {
        showMessage({ message: (error as any)?.toString?.(), type: 'warning' });
      }
    });

    PubSub.subscribe(MessageKeys.codeScan.address, (_, { data }) => {
      if (!utils.isAddress(data) && !isDomain(data)) {
        showMessage({ message: i18n.t('msg-invalid-address'), type: 'warning' });
        return;
      }

      setIsERC681(false);
      setVM(new TokenTransferring({ targetNetwork: Networks.current, to: data }));
      setTimeout(() => openSendModal(), 0);
      logScreenView('SendFundsModal_QR');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openSendFundsModal);
      PubSub.unsubscribe(MessageKeys.codeScan.ethereum);
      PubSub.unsubscribe(MessageKeys.codeScan.address);
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
      withHandle={!reviewing}
      panGestureEnabled={!reviewing}
      panGestureComponentEnabled={!reviewing}
      modalStyle={styles.containerTopBorderRadius}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      onClosed={() => {
        setIsERC681(false);
        setVM(undefined);
      }}
    >
      {vm && (
        <Send
          vm={vm}
          onClose={clear}
          erc681={isERC681}
          onReviewEnter={() => setReviewing(true)}
          onReviewLeave={() => setReviewing(false)}
        />
      )}
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

export const ShardsModal = observer(() => {
  const { ref, open, close } = useModalize();
  const [vms, setVMs] = useState<{ shardsDistributor?: ShardsDistributor; shardReceiver?: boolean }>({});
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openShardsDistribution, () => {
      setVMs({ shardsDistributor: new ShardsDistributor({ mnemonic: utils.entropyToMnemonic(randomBytes(16)) }) });
      open();
    });

    PubSub.subscribe(MessageKeys.openShardReceiver, () => {
      setVMs({ shardReceiver: true });
      open();
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openShardsDistribution);
    };
  });

  return (
    <Modalize
      ref={ref}
      useNativeDriver
      adjustToContentHeight
      withHandle={false}
      disableScrollIfPossible
      closeOnOverlayTap={!isCritical}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      modalStyle={{ backgroundColor: 'transparent' }}
      onClosed={() => {
        // __DEV__ && vms.shardsDistributor
        //   ? setTimeout(() => PubSub.publish(MessageKeys.openShardsDistribution), 1000)
        //   : undefined;
        setVMs({});
        setIsCritical(false);
      }}
    >
      <SafeAreaProvider>
        {vms.shardsDistributor && <ShardsDistributorUI vm={vms.shardsDistributor} onCritical={setIsCritical} close={close} />}
        {vms.shardReceiver ? <ShardReceiverUI /> : undefined}
      </SafeAreaProvider>
    </Modalize>
  );
});

export const FullScreenQRScanner = observer(() => {
  const { ref, open, close } = useModalize();
  const [tip, setTip] = useState<string>();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openGlobalQRScanner, (_, data) => {
      setTip(data);
      setTimeout(() => open(), 10);
      logScreenView('QRScan');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openGlobalQRScanner);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      useNativeDriver
      modalHeight={ReactiveScreen.height}
      closeOnOverlayTap={false}
      withHandle={false}
      disableScrollIfPossible
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      modalStyle={{
        borderTopStartRadius: 0,
        borderTopEndRadius: 0,
        backgroundColor: '#000',
        width: ReactiveScreen.width,
        height: ReactiveScreen.height,
        flexGrow: 1,
      }}
    >
      <SafeAreaProvider>
        <QRScan tip={tip} done={close} />
      </SafeAreaProvider>
    </Modalize>
  );
});

export const GlobalPasspadModal = () => {
  const { ref, open, close } = useModalize();
  const [req, setReq] = useState<{
    passLength?: number;
    onAutoAuthRequest: () => Promise<boolean>;
    onPinEntered: (pin: string) => Promise<boolean>;
    onClosed?: () => void;
  }>();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openGlobalPasspad, (_, data) => {
      setReq(data);
      open();
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openGlobalPasspad);
    };
  }, []);

  return (
    <Modalize
      ref={ref}
      useNativeDriver
      adjustToContentHeight
      withHandle={false}
      disableScrollIfPossible
      closeOnOverlayTap={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      modalStyle={{ backgroundColor: 'transparent' }}
      onClosed={() => {
        req?.onClosed?.();
        setReq(undefined);
      }}
    >
      <SafeAreaProvider>{req && <GlobalPasspad {...req} close={close} />}</SafeAreaProvider>
    </Modalize>
  );
};

export const LockScreen = observer(({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { ref: lockScreenRef, open: openLockScreen, close: closeLockScreen } = useModalize();

  const bioAuth = async () => {
    if (!appAuth.biometricEnabled || !appAuth.biometricSupported) return;

    const success = await appAuth.authorize();
    if (success) closeLockScreen();
  };

  useEffect(() => {
    const dispose = autorun(() => {
      if (!app.hasWallet || (appAuth.appAuthorized && appAuth.appAvailable)) return;

      openLockScreen();

      if (appAuth.appAvailable) {
        bioAuth();
      }

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
        appAvailable={appAuth.appAvailable}
        unlockTimestamp={appAuth.appUnlockTime}
        failedAttempts={appAuth.failedAttempts}
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
    <WalletConnect key="walletconnect" />,
    <WalletConnectRequests key="walletconnect-requests" {...props} />,
    <InpageDAppConnect key="inpage-dapp-connect" />,
    <InpageDAppRequests key="inpage-dapp-requests" />,
    <BackupTipsModal key="backup-tip" />,
    <ShardsModal key="key-distribution" />,
  ];
};
