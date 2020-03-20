import * as React from 'react';
import { IProps, IState, TOpen, TClose } from './options';
export declare class Modalize<FlatListItem = any, SectionListItem = any> extends React.Component<IProps<FlatListItem, SectionListItem>, IState> {
    static defaultProps: {
        handlePosition: string;
        useNativeDriver: boolean;
        adjustToContentHeight: boolean;
        disableScrollIfPossible: boolean;
        avoidKeyboardLikeIOS: boolean | undefined;
        modalTopOffset: number | undefined;
        panGestureEnabled: boolean;
        closeOnOverlayTap: boolean;
        withReactModal: boolean;
        withHandle: boolean;
        openAnimationConfig: {
            timing: {
                duration: number;
                easing: import('react-native').EasingFunction;
            };
            spring: {
                speed: number;
                bounciness: number;
            };
        };
        closeAnimationConfig: {
            timing: {
                duration: number;
                easing: import('react-native').EasingFunction;
            };
        };
        dragToss: number;
    };
    private snaps;
    private snapEnd;
    private beginScrollYValue;
    private beginScrollY;
    private dragY;
    private translateY;
    private reverseBeginScrollY;
    private modal;
    private modalChildren;
    private modalContentView;
    private contentView;
    private modalOverlay;
    private modalOverlayTap;
    private willCloseModalize;
    private initialComputedModalHeight;
    private modalPosition;
    constructor(props: IProps<FlatListItem, SectionListItem>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    open: (dest: TOpen) => void;
    close: (dest?: TClose) => void;
    scrollTo: (y?: number | {
        x?: number | undefined;
        y?: number | undefined;
        animated?: boolean | undefined;
    } | undefined, x?: number | undefined, animated?: boolean | undefined) => void;
    private get isHandleOutside();
    private get handleHeight();
    private get modalizeContent();
    private get overlayBackground();
    private onAnimateOpen;
    private onAnimateClose;
    private onModalizeContentLayout;
    private onContentViewLayout;
    private onHandleComponent;
    private onHandleChildren;
    private onHandleOverlay;
    private onBackPress;
    private onKeyboardShow;
    private onKeyboardHide;
    private renderComponent;
    private renderHandle;
    private renderHeader;
    private renderContent;
    private renderChildren;
    private renderFooter;
    private renderOverlay;
    private renderModalize;
    private renderReactModal;
    render(): React.ReactNode;
}
