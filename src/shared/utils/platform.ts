import { Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getWindowDimensions = () => Dimensions.get('window');
export const getScreenDimensions = () => Dimensions.get('screen');
