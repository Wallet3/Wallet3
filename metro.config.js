const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      // minifierConfig: {
      //   keep_classnames: true, // FIX typeorm
      //   keep_fnames: true, // FIX typeorm
      //   mangle: {
      //     keep_classnames: true, // FIX typeorm
      //     keep_fnames: true, // FIX typeorm
      //   },
      //   output: {
      //     ascii_only: true,
      //     quote_style: 3,
      //     wrap_iife: true,
      //   },
      //   sourceMap: {
      //     includeSources: false,
      //   },
      //   toplevel: false,
      //   compress: {
      //     reduce_funcs: false,
      //   },
      // },
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();
