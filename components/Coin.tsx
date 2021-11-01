import { Image, ImageResizeMode, ImageStyle, ImageURISource, StyleProp } from 'react-native';

import React from 'react';
import icons from '../assets/icons/crypto';

interface CoinProps {
  symbol: string;
  style?: StyleProp<ImageStyle>;
  iconUrl?: string;

  /**
   * Invoked on load error with {nativeEvent: {error}}
   */
  onError?: (() => void) | undefined;

  /**
   * Invoked when load either succeeds or fails
   */
  onLoadEnd?: (() => void) | undefined;

  /**
   * Invoked on load start
   */
  onLoadStart?: (() => void) | undefined;

  progressiveRenderingEnabled?: boolean | undefined;

  borderRadius?: number | undefined;

  borderTopLeftRadius?: number | undefined;

  borderTopRightRadius?: number | undefined;

  borderBottomLeftRadius?: number | undefined;

  borderBottomRightRadius?: number | undefined;

  /**
   * Determines how to resize the image when the frame doesn't match the raw
   * image dimensions.
   *
   * 'cover': Scale the image uniformly (maintain the image's aspect ratio)
   * so that both dimensions (width and height) of the image will be equal
   * to or larger than the corresponding dimension of the view (minus padding).
   *
   * 'contain': Scale the image uniformly (maintain the image's aspect ratio)
   * so that both dimensions (width and height) of the image will be equal to
   * or less than the corresponding dimension of the view (minus padding).
   *
   * 'stretch': Scale width and height independently, This may change the
   * aspect ratio of the src.
   *
   * 'repeat': Repeat the image to cover the frame of the view.
   * The image will keep it's size and aspect ratio. (iOS only)
   *
   * 'center': Scale the image down so that it is completely visible,
   * if bigger than the area of the view.
   * The image will not be scaled up.
   */
  resizeMode?: ImageResizeMode | undefined;

  /**
   * The mechanism that should be used to resize the image when the image's dimensions
   * differ from the image view's dimensions. Defaults to `auto`.
   *
   * - `auto`: Use heuristics to pick between `resize` and `scale`.
   *
   * - `resize`: A software operation which changes the encoded image in memory before it
   * gets decoded. This should be used instead of `scale` when the image is much larger
   * than the view.
   *
   * - `scale`: The image gets drawn downscaled or upscaled. Compared to `resize`, `scale` is
   * faster (usually hardware accelerated) and produces higher quality images. This
   * should be used if the image is smaller than the view. It should also be used if the
   * image is slightly bigger than the view.
   *
   * More details about `resize` and `scale` can be found at http://frescolib.org/docs/resizing-rotating.html.
   *
   * @platform android
   */
  resizeMethod?: 'auto' | 'resize' | 'scale' | undefined;

  /**
   * similarly to `source`, this property represents the resource used to render
   * the loading indicator for the image, displayed until image is ready to be
   * displayed, typically after when it got downloaded from network.
   */
  loadingIndicatorSource?: ImageURISource | undefined;

  /**
   * A unique identifier for this element to be used in UI Automation testing scripts.
   */
  testID?: string | undefined;

  /**
   * Used to reference react managed images from native code.
   */
  nativeID?: string | undefined;

  /**
   * A static image to display while downloading the final image off the network.
   */
  defaultSource?: ImageURISource | number | undefined;
}

export default (props: CoinProps) => {
  const symbol = props.symbol.toLowerCase();
  return <Image source={icons[symbol] || { uri: props.iconUrl }} style={{ width: 22, height: 22 }} {...props} />;
};
