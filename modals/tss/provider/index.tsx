import React, { useEffect, useState } from 'react';
import { useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../utils/hardware';

import BackableScrollTitles from '../../components/BackableScrollTitles';
import ModalRootContainer from '../../core/ModalRootContainer';
import { ShardProvider } from '../../../viewmodels/tss/ShardProvider';
import ShardProviderView from './ShardProvider';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ close, vm }: { close: () => void; vm: ShardProvider }) => {
  const { t } = i18n;

  const [height] = useState(390 + useOptimizedSafeBottom());
  const screenRadius = useOptimizedCornerRadius();

  const titles = [t('multi-sig-modal-title-request-secret-key')];

  useEffect(() => {
    let timer: NodeJS.Timer;

    vm.closed && (timer = setTimeout(() => close(), 3000));
    vm.once('close', () => (timer = setTimeout(() => close(), 3000)));

    () => {
      clearTimeout(timer);
      vm.dispose();
    };
  }, []);

  return (
    <ModalRootContainer style={{ height }}>
      <BackableScrollTitles
        titles={titles}
        currentIndex={0}
        onClosePress={close}
        style={{ flexGrow: 0, height: 32, marginBottom: 12, marginTop: screenRadius ? 4 : 0 }}
      />

      <ShardProviderView vm={vm} close={close} />
    </ModalRootContainer>
  );
});
