// ReactotronConfig.js
import Reactotron, { asyncStorage } from 'reactotron-react-native';

Reactotron
  .configure({ name: 'React Native Demo' }) // Optional configuration
  .use(asyncStorage()) // Add AsyncStorage plugin
  .useReactNative() // Add all built-in React Native plugins
  .connect(); // Connect to Reactotron
