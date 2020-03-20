"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_native_1 = require("react-native");
exports.hasAbsoluteStyle = (Component) => {
    if (!React.isValidElement(Component)) {
        return false;
    }
    // @ts-ignore
    const element = typeof Component === 'object' ? Component : Component();
    const style = Component && react_native_1.StyleSheet.flatten(element.props.style);
    return style && style.position === 'absolute';
};
