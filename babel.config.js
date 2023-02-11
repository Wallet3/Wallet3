module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      'babel-plugin-transform-typescript-metadata',
      '@babel/plugin-proposal-numeric-separator',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // [
      //   'module-resolver',
      //   {
      //     alias: {
      //       crypto: 'react-native-quick-crypto',
      //       stream: 'stream-browserify',
      //       buffer: '@craftzdog/react-native-buffer',
      //     },
      //   },
      // ],
    ],
  };
};
