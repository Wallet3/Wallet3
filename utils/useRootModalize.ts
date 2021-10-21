import { useCallback, useEffect, useState } from 'react';

import { Modalize } from 'react-native-modalize';

export type TOpen = 'default' | 'top';
export type TClose = 'default' | 'alwaysOpen';

export function useModalizeHooks(ref: Modalize) {
  const close = useCallback((dest?: TClose) => {
    ref.close(dest);
  }, []);

  const open = useCallback((dest?: TOpen) => {
    ref.open(dest);
  }, []);

  return { open, close };
}
