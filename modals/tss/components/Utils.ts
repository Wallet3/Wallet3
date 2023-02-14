import { getScreenCornerRadius } from '../../../utils/hardware';

export function calcHorizontalPadding() {
  return (getScreenCornerRadius() - 20) / 4 + 16;
}
