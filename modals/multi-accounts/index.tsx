import React, { useRef, useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import App from '../../viewmodels/core/App';
import { Confirm } from '../views/Confirm';
import EditAccount from './EditAccount';
import ImportWallet from './ImportWallet';
import MainPanel from './MainPanel';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import rootStyles from '../styles';
import { startLayoutAnimation } from '../../utils/animations';

export default observer(({ close }: { close?: Function }) => {
  const { t } = i18n;
  const swiper = useRef<Swiper>(null);
  const [type, setType] = useState('');
  const [account, setAccount] = useState<Account>();

  const onRemoveAccount = (account: Account) => {
    setType('removeAccount');
    setAccount(account);
    setTimeout(() => swiper.current?.scrollTo(1), 0);
  };

  const removeAccount = () => {
    if (!account) return;
    swiper.current?.scrollBy(-1);

    setTimeout(() => {
      startLayoutAnimation();
      App.removeAccount(account);
      setAccount(undefined);
    }, 300);
  };

  const cancelRemoveAccount = () => {
    swiper.current?.scrollBy(-1);
    setTimeout(() => setType(''), 500);
  };

  const editAccount = (account: Account) => {
    setType('editAccount');
    setAccount(account);
    setTimeout(() => swiper.current?.scrollTo(1), 0);
  };

  const editAccountDone = () => {
    swiper.current?.scrollBy(-1);
    setTimeout(() => setType(''), 500);
  };

  const onImportWallet = () => {
    setType('importWallet');
    setTimeout(() => swiper.current?.scrollTo(1), 0);
  };

  const onImportWalletDone = () => {
    swiper.current?.scrollBy(-1);
    setTimeout(() => setType(''), 500);
  };

  return (
    <SafeAreaProvider style={{ ...rootStyles.safeArea }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <MainPanel
          onRemoveAccount={onRemoveAccount}
          onEditAccount={editAccount}
          onImportWallet={onImportWallet}
          onDone={() => close?.()}
        />

        {type === 'removeAccount' && (
          <Confirm
            confirmButtonTitle={t('button-confirm')}
            cancelButtonTitle={t('button-cancel')}
            onConfirm={removeAccount}
            onCancel={cancelRemoveAccount}
            style={{ flex: 1 }}
            themeColor="crimson"
            desc={t('modal-multi-accounts-remove-account-desc', { addr: account?.displayName })}
            cancelable
          />
        )}

        {type === 'editAccount' && <EditAccount account={account} onDone={editAccountDone} />}

        {type === 'importWallet' && <ImportWallet onCancel={onImportWalletDone} onDone={onImportWalletDone} />}
      </Swiper>
    </SafeAreaProvider>
  );
});
