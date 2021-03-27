import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { StyleProp, TextStyle, ViewStyle, TextProps } from 'react-native';
import type { DefaultConfigType } from './config';
import type { RneFunctionComponent } from '../helpers';
export declare enum ToastTypes {
    info = "info",
    success = "success",
    warning = "warning",
    error = "error"
}
export declare enum ToastPosition {
    bottom = "bottom",
    top = "top"
}
export declare type StylePropsWithMessageType<T> = StyleProp<T> & {
    [key in ToastTypes]?: StyleProp<T>;
};
export declare type MessageState = {
    id: string;
    text: string;
    type: ToastTypes;
};
export declare type ToastProviderProps = {
    duration?: number;
    maxMessages?: number;
    position?: keyof typeof ToastPosition;
    containerToastStyle?: StyleProp<ViewStyle>;
    containerMessageStyle?: StylePropsWithMessageType<ViewStyle>;
    textMessageStyle?: StylePropsWithMessageType<TextStyle>;
    textMessageProps?: TextProps;
};
declare type ToastContextType = {
    messages: MessageState[];
    setMessage: Dispatch<SetStateAction<MessageState[]>>;
} & DefaultConfigType;
export declare const ToastContext: React.Context<ToastContextType>;
declare const ToastProvider: RneFunctionComponent<ToastProviderProps>;
export { ToastProvider };
declare const _default: React.FunctionComponent<Pick<ToastProviderProps, "position" | "duration" | "containerMessageStyle" | "textMessageStyle" | "textMessageProps" | "containerToastStyle" | "maxMessages">> | React.ForwardRefExoticComponent<ToastProviderProps>;
export default _default;
