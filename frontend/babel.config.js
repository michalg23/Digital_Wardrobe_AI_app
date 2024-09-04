module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin",
      ["module-resolver", { // Correct wrapping and naming for the plugin
        alias: {
          'react-native-vector-icons': '@expo/vector-icons'
        }
      }]
    ],
  };
};
