"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_native_1 = require("react-native");
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const get_spring_config_1 = require("./utils/get-spring-config");
const devices_1 = require("./utils/devices");
const has_absolute_style_1 = require("./utils/has-absolute-style");
const styles_1 = require("./styles");
const { height: screenHeight } = react_native_1.Dimensions.get('window');
const AnimatedKeyboardAvoidingView = react_native_1.Animated.createAnimatedComponent(react_native_1.KeyboardAvoidingView);
const AnimatedFlatList = react_native_1.Animated.createAnimatedComponent(react_native_1.FlatList);
const AnimatedSectionList = react_native_1.Animated.createAnimatedComponent(react_native_1.SectionList);
const THRESHOLD = 150;
class Modalize extends React.Component {
    constructor(props) {
        super(props);
        this.snaps = [];
        this.beginScrollYValue = 0;
        this.beginScrollY = new react_native_1.Animated.Value(0);
        this.dragY = new react_native_1.Animated.Value(0);
        this.translateY = new react_native_1.Animated.Value(screenHeight);
        this.modal = React.createRef();
        this.modalChildren = React.createRef();
        this.modalContentView = React.createRef();
        this.contentView = React.createRef();
        this.modalOverlay = React.createRef();
        this.modalOverlayTap = React.createRef();
        this.willCloseModalize = false;
        this.initialComputedModalHeight = 0;
        this.open = (dest) => {
            const { onOpen } = this.props;
            if (onOpen) {
                onOpen();
            }
            this.onAnimateOpen(undefined, dest);
        };
        this.close = (dest = 'default') => {
            const { onClose } = this.props;
            if (onClose) {
                onClose();
            }
            this.onAnimateClose(dest);
        };
        this.scrollTo = (...args) => {
            if (this.contentView.current) {
                this.contentView.current
                    .getNode()
                    .getScrollResponder()
                    .scrollTo(...args);
            }
        };
        this.onAnimateOpen = (alwaysOpen, dest = 'default') => {
            const { onOpened, snapPoint, useNativeDriver, openAnimationConfig, onPositionChange, } = this.props;
            const { timing, spring } = openAnimationConfig;
            const { overlay, modalHeight } = this.state;
            let toValue = 0;
            if (dest === 'top') {
                toValue = 0;
            }
            else if (alwaysOpen) {
                toValue = (modalHeight || 0) - alwaysOpen;
            }
            else if (snapPoint) {
                toValue = (modalHeight || 0) - snapPoint;
            }
            react_native_1.BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
            this.setState({
                isVisible: true,
                showContent: true,
            });
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(overlay, {
                    toValue: alwaysOpen ? 0 : 1,
                    duration: timing.duration,
                    easing: react_native_1.Easing.ease,
                    useNativeDriver,
                }),
                spring
                    ? react_native_1.Animated.spring(this.translateY, Object.assign(Object.assign({}, get_spring_config_1.getSpringConfig(spring)), { toValue,
                        useNativeDriver }))
                    : react_native_1.Animated.timing(this.translateY, {
                        toValue,
                        duration: timing.duration,
                        easing: timing.easing,
                        useNativeDriver,
                    }),
            ]).start(() => {
                if (onOpened) {
                    onOpened();
                }
                if (alwaysOpen || (snapPoint && dest === 'default')) {
                    this.modalPosition = 'initial';
                }
                else {
                    this.modalPosition = 'top';
                }
                if (onPositionChange) {
                    onPositionChange(this.modalPosition);
                }
            });
        };
        this.onAnimateClose = (dest = 'default') => {
            const { onClosed, useNativeDriver, snapPoint, closeAnimationConfig, alwaysOpen, onPositionChange, } = this.props;
            const { timing, spring } = closeAnimationConfig;
            const { overlay, modalHeight } = this.state;
            const lastSnap = snapPoint ? this.snaps[1] : 80;
            const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
            const toValue = toInitialAlwaysOpen ? (modalHeight || 0) - alwaysOpen : screenHeight;
            react_native_1.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
            this.beginScrollYValue = 0;
            this.beginScrollY.setValue(0);
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(overlay, {
                    toValue: 0,
                    duration: timing.duration,
                    easing: react_native_1.Easing.ease,
                    useNativeDriver,
                }),
                spring
                    ? react_native_1.Animated.spring(this.translateY, Object.assign(Object.assign({}, get_spring_config_1.getSpringConfig(spring)), { toValue,
                        useNativeDriver }))
                    : react_native_1.Animated.timing(this.translateY, {
                        duration: timing.duration,
                        easing: react_native_1.Easing.out(react_native_1.Easing.ease),
                        toValue,
                        useNativeDriver,
                    }),
            ]).start(() => {
                if (onClosed) {
                    onClosed();
                }
                if (alwaysOpen && dest === 'alwaysOpen' && onPositionChange) {
                    onPositionChange('initial');
                }
                if (alwaysOpen && dest === 'alwaysOpen') {
                    this.modalPosition = 'initial';
                }
                this.setState({ showContent: toInitialAlwaysOpen });
                this.translateY.setValue(toValue);
                this.dragY.setValue(0);
                this.willCloseModalize = false;
                this.setState({
                    lastSnap,
                    isVisible: toInitialAlwaysOpen,
                });
            });
        };
        this.onModalizeContentLayout = ({ nativeEvent: { layout } }) => {
            const { adjustToContentHeight } = this.props;
            const { keyboardHeight } = this.state;
            this.setState({
                modalHeight: Math.min(layout.height + (!adjustToContentHeight || keyboardHeight ? layout.y : 0), this.initialComputedModalHeight -
                    react_native_1.Platform.select({
                        ios: 0,
                        android: keyboardHeight,
                    })),
            });
        };
        this.onContentViewLayout = ({ nativeEvent }) => {
            const { adjustToContentHeight, disableScrollIfPossible, onLayout } = this.props;
            if (onLayout) {
                onLayout(nativeEvent);
            }
            if (!adjustToContentHeight) {
                return;
            }
            const { height } = nativeEvent.layout;
            const shorterHeight = height < this.initialComputedModalHeight;
            const disableScroll = shorterHeight && disableScrollIfPossible;
            this.setState({ disableScroll });
        };
        this.onHandleComponent = ({ nativeEvent }) => {
            if (nativeEvent.oldState === react_native_gesture_handler_1.State.BEGAN) {
                this.beginScrollY.setValue(0);
            }
            this.onHandleChildren({ nativeEvent });
        };
        this.onHandleChildren = ({ nativeEvent }) => {
            const { snapPoint, useNativeDriver, adjustToContentHeight, alwaysOpen, closeAnimationConfig, dragToss, onPositionChange, } = this.props;
            const { timing } = closeAnimationConfig;
            const { lastSnap, modalHeight, overlay } = this.state;
            const { velocityY, translationY } = nativeEvent;
            this.setState({ enableBounces: this.beginScrollYValue > 0 || translationY < 0 });
            if (nativeEvent.oldState === react_native_gesture_handler_1.State.ACTIVE) {
                const toValue = translationY - this.beginScrollYValue;
                let destSnapPoint = 0;
                if (snapPoint || alwaysOpen) {
                    const endOffsetY = lastSnap + toValue + dragToss * velocityY;
                    this.snaps.forEach((snap) => {
                        const distFromSnap = Math.abs(snap - endOffsetY);
                        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
                            destSnapPoint = snap;
                            this.willCloseModalize = false;
                            if (alwaysOpen) {
                                destSnapPoint = (modalHeight || 0) - alwaysOpen;
                            }
                            if (snap === this.snapEnd && !alwaysOpen) {
                                this.willCloseModalize = true;
                                this.close();
                            }
                        }
                    });
                }
                else if (translationY > (adjustToContentHeight ? (modalHeight || 0) / 3 : THRESHOLD) &&
                    this.beginScrollYValue === 0 &&
                    !alwaysOpen) {
                    this.willCloseModalize = true;
                    this.close();
                }
                if (this.willCloseModalize) {
                    return;
                }
                this.setState({ lastSnap: destSnapPoint });
                this.translateY.extractOffset();
                this.translateY.setValue(toValue);
                this.translateY.flattenOffset();
                this.dragY.setValue(0);
                if (alwaysOpen) {
                    react_native_1.Animated.timing(overlay, {
                        toValue: Number(destSnapPoint <= 0),
                        duration: timing.duration,
                        easing: react_native_1.Easing.ease,
                        useNativeDriver,
                    }).start();
                }
                react_native_1.Animated.spring(this.translateY, {
                    tension: 50,
                    friction: 12,
                    velocity: velocityY,
                    toValue: destSnapPoint,
                    useNativeDriver,
                }).start();
                if (this.beginScrollYValue === 0) {
                    const modalPosition = Boolean(destSnapPoint <= 0) ? 'top' : 'initial';
                    if (!adjustToContentHeight && modalPosition === 'top') {
                        this.setState({ disableScroll: false });
                    }
                    if (onPositionChange && this.modalPosition !== modalPosition) {
                        onPositionChange(modalPosition);
                    }
                    if (this.modalPosition !== modalPosition) {
                        this.modalPosition = modalPosition;
                    }
                }
            }
        };
        this.onHandleOverlay = ({ nativeEvent }) => {
            const { alwaysOpen, onOverlayPress } = this.props;
            if (nativeEvent.oldState === react_native_gesture_handler_1.State.ACTIVE && !this.willCloseModalize) {
                if (onOverlayPress) {
                    onOverlayPress();
                }
                const dest = !!alwaysOpen ? 'alwaysOpen' : 'default';
                this.close(dest);
            }
        };
        this.onBackPress = () => {
            const { onBackButtonPress, alwaysOpen } = this.props;
            if (alwaysOpen) {
                return false;
            }
            if (onBackButtonPress) {
                return onBackButtonPress();
            }
            else {
                this.close();
            }
            return true;
        };
        this.onKeyboardShow = (event) => {
            const { height } = event.endCoordinates;
            this.setState({ keyboardToggle: true, keyboardHeight: height });
        };
        this.onKeyboardHide = () => {
            this.setState({ keyboardToggle: false, keyboardHeight: 0 });
        };
        this.renderComponent = (Tag) => {
            return React.isValidElement(Tag) ? (Tag) : (
            // @ts-ignore
            React.createElement(Tag, null));
        };
        this.renderHandle = () => {
            const { handleStyle, useNativeDriver, withHandle, panGestureEnabled } = this.props;
            const handleStyles = [styles_1.default.handle];
            const shapeStyles = [styles_1.default.handle__shape, handleStyle];
            if (!withHandle) {
                return null;
            }
            if (!this.isHandleOutside) {
                handleStyles.push(styles_1.default.handleBottom);
                shapeStyles.push(styles_1.default.handle__shapeBottom, handleStyle);
            }
            return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { enabled: panGestureEnabled, simultaneousHandlers: this.modal, shouldCancelWhenOutside: false, onGestureEvent: react_native_1.Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
                    useNativeDriver,
                }), onHandlerStateChange: this.onHandleComponent },
                React.createElement(react_native_1.Animated.View, { style: handleStyles },
                    React.createElement(react_native_1.View, { style: shapeStyles }))));
        };
        this.renderHeader = () => {
            const { useNativeDriver, HeaderComponent, panGestureEnabled } = this.props;
            if (!HeaderComponent) {
                return null;
            }
            if (has_absolute_style_1.hasAbsoluteStyle(HeaderComponent)) {
                return this.renderComponent(HeaderComponent);
            }
            return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { enabled: panGestureEnabled, simultaneousHandlers: this.modal, shouldCancelWhenOutside: false, onGestureEvent: react_native_1.Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
                    useNativeDriver,
                }), onHandlerStateChange: this.onHandleComponent },
                React.createElement(react_native_1.Animated.View, { style: styles_1.default.component }, this.renderComponent(HeaderComponent))));
        };
        this.renderContent = () => {
            const { children, scrollViewProps, flatListProps, sectionListProps } = this.props;
            const { enableBounces, disableScroll, keyboardToggle } = this.state;
            const keyboardDismissMode = devices_1.isIos ? 'interactive' : 'on-drag';
            const opts = {
                ref: this.contentView,
                bounces: enableBounces,
                onScrollBeginDrag: react_native_1.Animated.event([{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }], { useNativeDriver: false }),
                scrollEventThrottle: 16,
                onLayout: this.onContentViewLayout,
                scrollEnabled: keyboardToggle || !disableScroll,
                keyboardDismissMode,
            };
            if (flatListProps) {
                return React.createElement(AnimatedFlatList, Object.assign({}, opts, flatListProps));
            }
            if (sectionListProps) {
                return React.createElement(AnimatedSectionList, Object.assign({}, opts, sectionListProps));
            }
            return (React.createElement(react_native_1.Animated.ScrollView, Object.assign({}, opts, scrollViewProps), children));
        };
        this.renderChildren = () => {
            const { useNativeDriver, adjustToContentHeight, panGestureEnabled } = this.props;
            return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { ref: this.modalChildren, enabled: panGestureEnabled, simultaneousHandlers: [this.modalContentView, this.modal], shouldCancelWhenOutside: false, onGestureEvent: react_native_1.Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
                    useNativeDriver,
                }), minDist: 20, activeOffsetY: 20, activeOffsetX: 20, onHandlerStateChange: this.onHandleChildren },
                React.createElement(react_native_1.Animated.View, { style: !adjustToContentHeight ? styles_1.default.content__container : styles_1.default.content__adjustHeight },
                    React.createElement(react_native_gesture_handler_1.NativeViewGestureHandler, { ref: this.modalContentView, waitFor: this.modal, simultaneousHandlers: this.modalChildren }, this.renderContent()))));
        };
        this.renderFooter = () => {
            const { FooterComponent } = this.props;
            if (!FooterComponent) {
                return null;
            }
            return this.renderComponent(FooterComponent);
        };
        this.renderOverlay = () => {
            const { useNativeDriver, overlayStyle, alwaysOpen, panGestureEnabled, closeOnOverlayTap, } = this.props;
            const { showContent } = this.state;
            const pointerEvents = alwaysOpen && (this.modalPosition === 'initial' || !this.modalPosition) ? 'box-none' : 'auto';
            return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { ref: this.modalOverlay, enabled: panGestureEnabled, simultaneousHandlers: [this.modal], shouldCancelWhenOutside: false, onGestureEvent: react_native_1.Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
                    useNativeDriver,
                }), onHandlerStateChange: this.onHandleChildren },
                React.createElement(react_native_1.Animated.View, { style: styles_1.default.overlay, pointerEvents: pointerEvents }, showContent && (React.createElement(react_native_gesture_handler_1.TapGestureHandler, { ref: this.modalOverlayTap, enabled: panGestureEnabled || closeOnOverlayTap, onHandlerStateChange: this.onHandleOverlay },
                    React.createElement(react_native_1.Animated.View, { style: [styles_1.default.overlay__background, overlayStyle, this.overlayBackground], pointerEvents: pointerEvents }))))));
        };
        this.renderModalize = () => {
            const { keyboardAvoidingOffset, modalStyle, keyboardAvoidingBehavior, alwaysOpen, panGestureEnabled, avoidKeyboardLikeIOS, } = this.props;
            const { isVisible, lastSnap, showContent } = this.state;
            const pointerEvents = alwaysOpen ? 'box-none' : 'auto';
            const keyboardAvoidingViewProps = {
                keyboardVerticalOffset: keyboardAvoidingOffset,
                behavior: keyboardAvoidingBehavior || 'padding',
                enabled: avoidKeyboardLikeIOS,
                style: [styles_1.default.modalize__content, this.modalizeContent, modalStyle],
            };
            if (!avoidKeyboardLikeIOS) {
                keyboardAvoidingViewProps.onLayout = this.onModalizeContentLayout;
            }
            if (!isVisible) {
                return null;
            }
            return (React.createElement(react_native_1.View, { style: styles_1.default.modalize, pointerEvents: pointerEvents },
                React.createElement(react_native_gesture_handler_1.TapGestureHandler, { ref: this.modal, maxDurationMs: 100000, maxDeltaY: lastSnap, enabled: panGestureEnabled },
                    React.createElement(react_native_1.View, { style: styles_1.default.modalize__wrapper, pointerEvents: "box-none" },
                        showContent && (React.createElement(AnimatedKeyboardAvoidingView, Object.assign({}, keyboardAvoidingViewProps),
                            this.renderHandle(),
                            this.renderHeader(),
                            this.renderChildren(),
                            this.renderFooter())),
                        this.renderOverlay()))));
        };
        this.renderReactModal = (child) => {
            const { useNativeDriver } = this.props;
            const { isVisible } = this.state;
            return (React.createElement(react_native_1.Modal, { supportedOrientations: ['landscape', 'portrait', 'portrait-upside-down'], onRequestClose: this.onBackPress, hardwareAccelerated: useNativeDriver, visible: isVisible, transparent: true }, child));
        };
        const fullHeight = screenHeight - props.modalTopOffset;
        const computedHeight = fullHeight - this.handleHeight - (devices_1.isIphoneX ? 34 : 0);
        const modalHeight = props.modalHeight || computedHeight;
        this.initialComputedModalHeight = modalHeight;
        if (props.withReactModal) {
            console.warn(`[react-native-modalize] 'withReactModal' is set to 'true'. Modal from react-native is going to be moved out of the core in the future. I\'d recommend migrating to something like react-navigation or react-native-navigation\'s to wrap Modalize. Check out the documentation for more informations.`);
        }
        if (props.modalHeight && props.adjustToContentHeight) {
            console.error(`[react-native-modalize] You cannot use both 'modalHeight' and 'adjustToContentHeight' props at the same time. Only choose one of the two.`);
        }
        if ((props.scrollViewProps || props.children) && props.flatListProps) {
            console.error(`[react-native-modalize] 'flatListProps' You can\'t use the ScrollView and the FlatList at the 'same time. As soon as you use 'flatListProps' it will replaces the default ScrollView with 'a FlatList component. Remove the 'children' and/or 'scrollViewProps' to fix the error.`);
        }
        if ((props.scrollViewProps || props.children) && props.sectionListProps) {
            console.error(`[react-native-modalize] 'sectionListProps' You can\'t use the ScrollView and the SectionList at the 'same time. As soon as you use 'sectionListProps' it will replaces the default ScrollView with 'a SectionList component. Remove the 'children' and/or 'scrollViewProps' to fix the error.`);
        }
        if (props.snapPoint) {
            this.snaps.push(0, modalHeight - props.snapPoint, modalHeight);
        }
        else {
            this.snaps.push(0, modalHeight);
        }
        this.snapEnd = this.snaps[this.snaps.length - 1];
        this.state = {
            lastSnap: props.snapPoint ? modalHeight - props.snapPoint : 0,
            isVisible: false,
            showContent: true,
            overlay: new react_native_1.Animated.Value(0),
            modalHeight: props.adjustToContentHeight ? undefined : modalHeight,
            contentHeight: 0,
            enableBounces: true,
            keyboardToggle: false,
            keyboardHeight: 0,
            disableScroll: props.alwaysOpen ? true : undefined,
        };
        this.beginScrollY.addListener(({ value }) => (this.beginScrollYValue = value));
        this.reverseBeginScrollY = react_native_1.Animated.multiply(new react_native_1.Animated.Value(-1), this.beginScrollY);
    }
    componentDidMount() {
        const { alwaysOpen } = this.props;
        if (alwaysOpen) {
            this.onAnimateOpen(alwaysOpen);
        }
        react_native_1.Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
        react_native_1.Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
    }
    componentWillUnmount() {
        react_native_1.BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
        react_native_1.Keyboard.removeListener('keyboardDidShow', this.onKeyboardShow);
        react_native_1.Keyboard.removeListener('keyboardDidHide', this.onKeyboardHide);
    }
    get isHandleOutside() {
        const { handlePosition } = this.props;
        return handlePosition === 'outside';
    }
    get handleHeight() {
        const { withHandle } = this.props;
        if (!withHandle) {
            return 20;
        }
        return this.isHandleOutside ? 35 : 20;
    }
    get modalizeContent() {
        const { modalHeight } = this.state;
        const valueY = react_native_1.Animated.add(this.dragY, this.reverseBeginScrollY);
        return {
            height: modalHeight,
            maxHeight: this.initialComputedModalHeight,
            transform: [
                {
                    translateY: react_native_1.Animated.add(this.translateY, valueY).interpolate({
                        inputRange: [-40, 0, this.snapEnd],
                        outputRange: [0, 0, this.snapEnd],
                        extrapolate: 'clamp',
                    }),
                },
            ],
        };
    }
    get overlayBackground() {
        const { overlay } = this.state;
        return {
            opacity: overlay.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
            }),
        };
    }
    render() {
        const { withReactModal } = this.props;
        if (withReactModal) {
            return this.renderReactModal(this.renderModalize());
        }
        return this.renderModalize();
    }
}
exports.Modalize = Modalize;
Modalize.defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    disableScrollIfPossible: true,
    avoidKeyboardLikeIOS: react_native_1.Platform.select({
        ios: true,
        android: false,
    }),
    modalTopOffset: react_native_1.Platform.select({
        ios: 0,
        android: react_native_1.StatusBar.currentHeight || 0,
    }),
    panGestureEnabled: true,
    closeOnOverlayTap: true,
    withReactModal: false,
    withHandle: true,
    openAnimationConfig: {
        timing: { duration: 280, easing: react_native_1.Easing.ease },
        spring: { speed: 14, bounciness: 4 },
    },
    closeAnimationConfig: {
        timing: { duration: 280, easing: react_native_1.Easing.ease },
    },
    dragToss: 0.05,
};
