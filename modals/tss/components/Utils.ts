import { DefaultCornerRadius, getScreenCornerRadius } from '../../../utils/hardware';

export function calcHorizontalPadding() {
  return (getScreenCornerRadius() - DefaultCornerRadius) / 4 + 16;
}
