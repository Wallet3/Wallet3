import { DefaultCornerRadius, getScreenCornerRadius } from '../../../utils/hardware';

import { useState } from 'react';

export function useHorizontalPadding() {
  const [padding] = useState((getScreenCornerRadius() - DefaultCornerRadius) / 4 + 16);
  return padding;
}
