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
import {
  ConnectInpageDApp,
  InpageDAppAddAsset,
  InpageDAppAddEthereumChain,
  InpageDAppSignRequest,
  InpageDAppTxRequest,
} from './browser/controller/InpageDAppController';
import { ERC681, ERC681Transferring } from '../viewmodels/transferring/ERC681Transferring';
import React, { useEffect, useState } from 'react';
import {
  ShardProviderUI,
  ShardReceiverUI,
  ShardRedistributionReceiverUI,
  ShardsAggregatorUI,
  ShardsDistributorUI,
} from '../modals/tss';

import { AppVM } from '../viewmodels/core/App';
import { Authentication } from '../viewmodels/auth/Authentication';
import { ClientInfo } from '../common/p2p/Constants';
import { FullPasspad } from '../modals/views/Passpad';
import GlobalPasspad from '../modals/global/GlobalPasspad';
import { IConfigProps } from 'react-native-modalize/lib/options';
import InactiveDevicesWarn from '../modals/misc/InactiveDevicesWarn';
import InappBrowser from '../modals/app/InappBrowser';
import InpageConnectDApp from '../modals/inpage/InpageConnectDApp';
import InpageDAppAddAssetModal from '../modals/inpage/InpageDAppAddAsset';
import InpageDAppAddChain from '../modals/inpage/InpageDAppAddChain';
import InpageDAppSendTx from '../modals/inpage/InpageDAppTxRequest';
import InpageDAppSign from '../modals/inpage/InpageDAppSign';
import { KeyRecoveryProvider } from '../viewmodels/tss/KeyRecoveryProvider';
import { KeyRecoveryRequestor } from '../viewmodels/tss/KeyRecoveryRequestor';
import { Keyboard } from 'react-native';
import Loading from '../modals/views/Loading';
import MessageKeys from '../common/MessageKeys';
import ModalizeContainer from '../modals/core/ModalizeContainer';
import { MultiSigKeyDeviceInfo } from '../models/entities/MultiSigKey';
import MultiSigKeyProvider from '../modals/tss/recovery/provider';
import MultiSigKeyRequestor from '../modals/tss/recovery/requestor';
import Networks from '../viewmodels/core/Networks';
import { PairedDevice } from '../viewmodels/tss/management/PairedDevice';
import { ReactiveScreen } from '../utils/device';
import { Service } from 'react-native-zeroconf';
import { ShardProvider } from '../viewmodels/tss/ShardProvider';
import { ShardsAggregator } from '../viewmodels/tss/ShardsAggregator';
import { ShardsDistributor } from '../viewmodels/tss/ShardsDistributor';
import SquircleModalize from '../modals/core/SquircleModalize';
import Theme from '../viewmodels/settings/Theme';
import { TokenTransferring } from '../viewmodels/transferring/TokenTransferring';
import UpgradeWalletTip from '../modals/misc/UpgradeWalletTip';
import { WCCallRequestRequest } from '../models/entities/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../viewmodels/walletconnect/WalletConnect_v2';
import { autorun } from 'mobx';
import i18n from '../i18n';
import { isDomain } from '../viewmodels/services/DomainResolver';
import { logScreenView } from '../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';
import { parse } from 'eth-url-parser';
import { showMessage } from 'react-native-flash-message';
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
    <SquircleModalize
      ref={ref}
      withHandle={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      tapGestureEnabled={false}
      closeOnOverlayTap={false}
    >
      {type === 'sign' ? <WalletConnectSign client={client!} request={callRequest!} close={close} /> : undefined}
      {type === 'sendTx' ? <WalletConnectTxRequest client={client!} request={callRequest!} close={close} /> : undefined}
    </SquircleModalize>
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
    <SquircleModalize
      ref={connectDappRef}
      withHandle={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      tapGestureEnabled={false}
      closeOnOverlayTap={false}
    >
      <WalletConnectDApp uri={state.uri} close={closeConnectDapp} extra={state.extra} directClient={state.client_v2} />
    </SquircleModalize>
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
    <SquircleModalize
      ref={connectDappRef}
      withHandle={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      tapGestureEnabled={false}
      closeOnOverlayTap={false}
    >
      <InpageConnectDApp {...info} close={close} approve={data?.approve} reject={data?.reject} />
    </SquircleModalize>
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
    <SquircleModalize
      ref={ref}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      tapGestureEnabled={false}
      closeOnOverlayTap={false}
      withHandle={false}
    >
      {type === 'sign' && <InpageDAppSign {...signRequest!} close={close} />}
      {type === 'sendTx' && <InpageDAppSendTx {...txRequest!} close={close} />}
      {type === 'addChain' && <InpageDAppAddChain {...addChain!} close={close} />}
      {type === 'addAsset' && <InpageDAppAddAssetModal {...addAsset!} close={close} />}
    </SquircleModalize>
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
    <SquircleModalize ref={networksRef} withHandle={!editing} closeOnOverlayTap={!editing} panGestureEnabled={!editing}>
      <NetworksMenu
        useContextMenu
        onEditing={setEditing}
        selectedNetwork={Networks.current}
        onNetworkPress={(network) => {
          closeNetworksModal();
          Networks.switch(network);
        }}
      />
    </SquircleModalize>
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
    <SquircleModalize ref={ref}>
      <AccountsMenu close={close} />
    </SquircleModalize>
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
    <SquircleModalize
      ref={ref}
      withHandle={false}
      closeOnOverlayTap={false}
      squircleContainerStyle={{ height: 439, justifyContent: 'center', alignItems: 'center' }}
    >
      <Loading />
    </SquircleModalize>
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
    <SquircleModalize
      ref={requestRef}
      adjustToContentHeight
      disableScrollIfPossible
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
    >
      <Request close={close} />
    </SquircleModalize>
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
    <SquircleModalize
      key="SendFunds"
      ref={sendRef}
      withHandle={!reviewing}
      panGestureEnabled={!reviewing}
      panGestureComponentEnabled={!reviewing}
      onClosed={() => {
        setIsERC681(false);
        setVM(undefined);
      }}
    >
      {vm && (
        <Send
          vm={vm}
          close={clear}
          erc681={isERC681}
          onReviewEnter={() => setReviewing(true)}
          onReviewLeave={() => setReviewing(false)}
        />
      )}
    </SquircleModalize>
  );
};

const BackupTipsModal = () => {
  const { ref, open, close } = useModalize();
  const [context, setContext] = useState<{ upgrade?: boolean; inactiveDevices?: MultiSigKeyDeviceInfo[] }>({});

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openUpgradeWalletTip, () => {
      setContext({ upgrade: true });
      setImmediate(() => open());
    });

    PubSub.subscribe(MessageKeys.openInactiveDevicesTip, (_, { devices }) => {
      setContext({ inactiveDevices: devices });
      setImmediate(() => open());
    });

    return () => [MessageKeys.openUpgradeWalletTip, MessageKeys.openInactiveDevicesTip].forEach((t) => PubSub.unsubscribe(t));
  }, []);

  return (
    <ModalizeContainer ref={ref} withHandle={false} panGestureEnabled={false} panGestureComponentEnabled={false}>
      {context.upgrade && <UpgradeWalletTip onDone={close} />}
      {context.inactiveDevices && <InactiveDevicesWarn onDone={close} devices={context.inactiveDevices} />}
    </ModalizeContainer>
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
    <ModalizeContainer
      ref={ref}
      closeOnOverlayTap={false}
      withHandle={false}
      modalHeight={height}
      adjustToContentHeight={undefined}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      safeAreaStyle={{ width, height }}
    >
      {props ? (
        <InappBrowser
          {...props}
          close={() => {
            close();
            setTimeout(() => setProps(undefined), 500);
          }}
        />
      ) : undefined}
    </ModalizeContainer>
  );
});

type ShardsParam = {
  shardsDistributor?: ShardsDistributor;
  shardReceiver?: boolean;
  shardsAggregator?: ShardsAggregator;
  shardProvider?: ShardProvider;
  keyRecoveryRequestor?: KeyRecoveryRequestor;
  keyRecoveryProviderService?: Service;
  shardRedistributionReceiverService?: Service;
  pairedDevice?: PairedDevice;
  onClosed?: () => void;
  openAnimationConfig?: IConfigProps;
  modalHeight?: number;
};

export const ShardsModal = observer(() => {
  const { ref, open, close } = useModalize();
  const [isCritical, setIsCritical] = useState(false);
  const [vms, setVMs] = useState<ShardsParam | undefined>();
  const [queue] = useState<ShardsParam[]>([]);

  const enqueue = (param: ShardsParam) => {
    queue.push(param);

    if (vms) return;
    setVMs(queue.shift()!);
    setImmediate(() => open());
  };

  const dequeue = () => {
    setIsCritical(false);
    setVMs(undefined);

    const next = queue.shift();
    if (!next) return;

    setVMs(next);
    setImmediate(() => open());
  };

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openShardsDistribution, (_, { vm, onClosed }) => {
      enqueue({ shardsDistributor: vm, onClosed });
    });

    PubSub.subscribe(MessageKeys.openShardReceiver, () => {
      enqueue({ shardReceiver: true });
    });

    PubSub.subscribe(MessageKeys.openShardProvider, (_, { vm, onClosed }) => {
      enqueue({ shardProvider: vm, onClosed });
    });

    PubSub.subscribe(MessageKeys.openKeyRecoveryRequestor, (_, { vm, onClosed }) => {
      enqueue({ keyRecoveryRequestor: vm, onClosed });
    });

    PubSub.subscribe(MessageKeys.openKeyRecoveryProvider, (_, { service, onClosed }) => {
      enqueue({ keyRecoveryProviderService: service, onClosed });
    });

    PubSub.subscribe(MessageKeys.openShardRedistributionReceiver, (_, { service, onClosed, device }) => {
      enqueue({ shardRedistributionReceiverService: service, onClosed, pairedDevice: device });
    });

    return () =>
      [
        MessageKeys.openShardsDistribution,
        MessageKeys.openShardReceiver,

        MessageKeys.openShardProvider,
        MessageKeys.openKeyRecoveryRequestor,
        MessageKeys.openShardRedistributionReceiver,
      ].forEach(PubSub.unsubscribe);
  }, []);

  return (
    <ModalizeContainer
      ref={ref}
      withHandle={false}
      closeOnOverlayTap={!isCritical}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      openAnimationConfig={vms?.openAnimationConfig}
      modalHeight={vms?.modalHeight}
      adjustToContentHeight={vms?.modalHeight ? false : true}
      onClosed={() => {
        vms?.onClosed?.();
        dequeue();
      }}
    >
      {vms?.shardsDistributor && <ShardsDistributorUI vm={vms.shardsDistributor} onCritical={setIsCritical} close={close} />}
      {vms?.shardReceiver && <ShardReceiverUI close={close} onCritical={setIsCritical} />}
      {vms?.shardProvider && <ShardProviderUI vm={vms.shardProvider} close={close} />}
      {vms?.keyRecoveryRequestor && <MultiSigKeyRequestor vm={vms.keyRecoveryRequestor} close={close} />}
      {vms?.keyRecoveryProviderService && <MultiSigKeyProvider service={vms.keyRecoveryProviderService} close={close} />}
      {vms?.shardRedistributionReceiverService && (
        <ShardRedistributionReceiverUI
          close={close}
          device={vms.pairedDevice!}
          onCritical={setIsCritical}
          service={vms.shardRedistributionReceiverService}
        />
      )}
    </ModalizeContainer>
  );
});

export const PriorityShardsModal = observer(() => {
  const { ref, open, close } = useModalize();
  const [isCritical, setIsCritical] = useState(false);
  const [vms, setVMs] = useState<ShardsParam | undefined>();
  const [queue] = useState<ShardsParam[]>([]);

  const enqueue = (param: ShardsParam) => {
    queue.push(param);

    if (vms) return;
    setVMs(queue.shift()!);
    setImmediate(() => open());
  };

  const dequeue = () => {
    setIsCritical(false);
    setVMs(undefined);

    const next = queue.shift();
    if (!next) return;

    setVMs(next);
    setImmediate(() => open());
  };

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openShardsAggregator, (_, { vm, onClosed }) => {
      enqueue({
        shardsAggregator: vm,
        onClosed,
        openAnimationConfig: { timing: { duration: 100 } },
        modalHeight: ReactiveScreen.height,
      });
    });

    return () => [MessageKeys.openShardsAggregator].forEach(PubSub.unsubscribe);
  }, []);

  return (
    <ModalizeContainer
      ref={ref}
      withHandle={false}
      closeOnOverlayTap={!isCritical}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      openAnimationConfig={vms?.openAnimationConfig}
      modalHeight={vms?.modalHeight}
      adjustToContentHeight={vms?.modalHeight ? false : true}
      onClosed={() => {
        vms?.onClosed?.();
        dequeue();
      }}
    >
      {vms?.shardsAggregator && <ShardsAggregatorUI close={close} vm={vms.shardsAggregator} />}
    </ModalizeContainer>
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
    <ModalizeContainer
      ref={ref}
      modalHeight={ReactiveScreen.height}
      adjustToContentHeight={undefined}
      closeOnOverlayTap={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      withHandle={false}
      modalStyle={{
        borderTopStartRadius: 0,
        borderTopEndRadius: 0,
        backgroundColor: '#000',
        width: ReactiveScreen.width,
        height: ReactiveScreen.height,
        flexGrow: 1,
      }}
    >
      <QRScan tip={tip} close={close} />
    </ModalizeContainer>
  );
});

export const GlobalPasspadModal = () => {
  const { ref, open, close } = useModalize();
  const [req, setReq] = useState<{
    passLength?: number;
    onAutoAuthRequest: () => Promise<boolean>;
    onPinEntered: (pin: string) => Promise<boolean>;
    onClosed?: () => void;
    closeOnOverlayTap?: boolean;
  }>();

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openGlobalPasspad, (_, data) => {
      setReq(data);
      setImmediate(() => open());
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.openGlobalPasspad);
    };
  }, []);

  return (
    <ModalizeContainer
      ref={ref}
      closeOnOverlayTap={req?.closeOnOverlayTap ?? false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      withHandle={false}
      onClosed={() => {
        req?.onClosed?.();
        setReq(undefined);
      }}
    >
      {req && <GlobalPasspad {...req} close={close} />}
    </ModalizeContainer>
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
      if (!app.hasWalletSet || (appAuth.appAuthorized && appAuth.appAvailable)) return;

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
    <ModalizeContainer
      ref={lockScreenRef}
      modalHeight={ReactiveScreen.height}
      adjustToContentHeight={undefined}
      closeOnOverlayTap={false}
      withHandle={false}
      panGestureEnabled={false}
      panGestureComponentEnabled={false}
      modalStyle={{ borderTopStartRadius: 0, borderTopEndRadius: 0 }}
      safeAreaStyle={{ backgroundColor: Theme.backgroundColor }}
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
    </ModalizeContainer>
  );
});

export default (props: { app: AppVM; appAuth: Authentication }) => {
  return [
    <BackupTipsModal key="backup-tip" />,
    <SendFundsModal key="send-funds" />,
    <RequestFundsModal key="request-funds" />,
    <GlobalNetworksMenuModal key="networks-menu" />,
    <GlobalAccountsMenuModal key="accounts-menu" />,
    <GlobalLoadingModal key="loading-modal" />,
    <WalletConnect key="walletconnect" />,
    <WalletConnectRequests key="walletconnect-requests" {...props} />,
    <InpageDAppConnect key="inpage-dapp-connect" />,
    <InpageDAppRequests key="inpage-dapp-requests" />,
    <ShardsModal key="shards-management" />,
    <GlobalPasspadModal key="global-passpad" />,
    <PriorityShardsModal key="shards-aggregation" />,
  ];
};
