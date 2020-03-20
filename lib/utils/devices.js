"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const { width, height } = react_native_1.Dimensions.get('window');
exports.isIos = react_native_1.Platform.OS === 'ios';
exports.isIphoneX = exports.isIos && (height === 812 || width === 812 || height === 896 || width === 896);
