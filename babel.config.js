module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      'babel-plugin-transform-typescript-metadata',
      '@babel/plugin-proposal-numeric-separator',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      [
        'module-resolver',
        {
          alias: {
            'expo-random': 'expo-crypto',
            '@account-abstraction/contracts': '@wallet3/account-abstraction-contracts',
          },
        },
      ],
    ],
  };
};
