import React, {
  useEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

import {
  StylePropsWithMessageType,
  ToastContext,
  ToastPosition,
  ToastTypes,
} from './ToastProvider';

import { renderNode } from '../helpers';

import type { VFC } from 'react';
import type { MessageState } from './ToastProvider';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

type MessageProps = {
  message: MessageState;
  onHide: () => void;
};

const Message: VFC<MessageProps> = ({ message, onHide }) => {
  const {
    duration,
    position,
    containerMessageStyle,
    textMessageStyle,
    textMessageProps,
  } = useContext(ToastContext);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animationContainerStyles = useMemo(
    () => ({
      opacity,
      transform: [
        {
          translateY: opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [position === ToastPosition.top ? -20 : 20, 0],
          }),
        },
      ],
    }),
    [opacity, position]
  );

  const createTypedStyles = useCallback(
    function <T>(styles: StylePropsWithMessageType<T>): StyleProp<T> {
      const localStyles = {
        ...(styles as object),
      } as StylePropsWithMessageType<T>;
      const typedStyles = { ...((localStyles[message.type] ?? {}) as object) };

      for (let key in ToastTypes) {
        delete localStyles[key as keyof StylePropsWithMessageType<T>];
      }

      return Object.keys(typedStyles as object).length > 0
        ? ({
            ...(localStyles as object),
            ...(typedStyles as object),
          } as StyleProp<T>)
        : localStyles;
    },
    [message.type]
  );

  const typedContainerStyles = createTypedStyles<ViewStyle>(
    containerMessageStyle
  );
  const typedTextStyles = createTypedStyles<TextStyle>(textMessageStyle);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        animationContainerStyles,
        typedContainerStyles,
      ])}
    >
      {renderNode(Text, message.text, {
        style: typedTextStyles,
        ...textMessageProps,
      })}
    </Animated.View>
  );
};

export default Message;
