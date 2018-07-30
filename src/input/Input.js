import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TextInput,
  Animated,
  Easing,
  Platform,
} from 'react-native';

import { nodeType, renderNode } from '../helpers';
import {
  fonts,
  merge,
  ThemeConsumer,
  ViewPropTypes,
  TextPropTypes,
} from '../config';

import Icon from '../icons/Icon';

const Input = props => {
  const {
    containerStyle,
    inputContainerStyle,
    leftIcon,
    leftIconContainerStyle,
    rightIcon,
    rightIconContainerStyle,
    inputComponent: InputComponent = TextInput,
    inputStyle,
    errorProps,
    errorStyle,
    errorMessage,
    label,
    labelStyle,
    labelProps,
    theme,
    translateX,
    inputRef,
    ...attributes
  } = props;

  return (
    <View style={[{ width: '90%' }, containerStyle]}>
      {!!label && (
        <Text {...labelProps} style={[styles.label(theme), labelStyle]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer(theme),
          inputContainerStyle,
          { transform: [{ translateX }] },
        ]}
      >
        {leftIcon && (
          <View style={[styles.iconContainer, leftIconContainerStyle]}>
            {renderNode(Icon, leftIcon)}
          </View>
        )}

        <InputComponent
          underlineColorAndroid="transparent"
          {...attributes}
          ref={inputRef}
          style={[styles.input, inputStyle]}
        />

        {rightIcon && (
          <View style={[styles.iconContainer, rightIconContainerStyle]}>
            {renderNode(Icon, rightIcon)}
          </View>
        )}
      </Animated.View>

      {!!errorMessage && (
        <Text
          {...errorProps}
          style={[styles.error(theme), errorStyle && errorStyle]}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

Input.propTypes = {
  containerStyle: ViewPropTypes.style,
  inputContainerStyle: ViewPropTypes.style,
  leftIcon: nodeType,
  leftIconContainerStyle: ViewPropTypes.style,
  rightIcon: nodeType,
  rightIconContainerStyle: ViewPropTypes.style,
  inputStyle: TextPropTypes.style,
  inputComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  shake: PropTypes.any,
  errorProps: TextPropTypes,
  errorStyle: TextPropTypes.style,
  errorMessage: PropTypes.string,
  label: PropTypes.string,
  labelStyle: TextPropTypes.style,
  labelProps: TextPropTypes,
  theme: PropTypes.object,
  inputRef: PropTypes.func,
  translateX: PropTypes.object,
};

const styles = {
  inputContainer: theme => ({
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
    borderColor: theme.colors.grey3,
  }),
  iconContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  input: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
    height: 40,
  },
  error: theme => ({
    margin: 5,
    fontSize: 12,
    color: theme.colors.error,
  }),
  label: theme => ({
    fontSize: 16,
    color: theme.colors.grey3,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
      android: {
        ...fonts.android.bold,
      },
    }),
  }),
};

export default class ThemedInput extends React.Component {
  shakeAnimationValue = new Animated.Value(0);

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  clear() {
    this.input.clear();
  }

  isFocused() {
    return this.input.isFocused();
  }

  shake = () => {
    const { shakeAnimationValue } = this;

    shakeAnimationValue.setValue(0);
    // Animation duration based on Material Design
    // https://material.io/guidelines/motion/duration-easing.html#duration-easing-common-durations
    Animated.timing(shakeAnimationValue, {
      duration: 375,
      toValue: 3,
      ease: Easing.bounce,
    }).start();
  };

  render() {
    const translateX = this.shakeAnimationValue.interpolate({
      inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
      outputRange: [0, -15, 0, 15, 0, -15, 0],
    });

    return (
      <ThemeConsumer>
        {({ theme }) => (
          <Input
            inputRef={input => (this.input = input)}
            {...merge({}, theme.Input, this.props)}
            theme={theme}
            translateX={translateX}
          />
        )}
      </ThemeConsumer>
    );
  }
}
