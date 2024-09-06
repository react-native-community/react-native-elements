import React from 'react';
import { StyleSheet } from 'react-native';
import { ButtonProps, Button } from '../Button';
import { RneFunctionComponent } from '../helpers';

export interface DialogButtonProps extends ButtonProps {}

/** This is used to add a button to the Dialog.
 * Receives all [Button](button#props) props. */
export const DialogButton: RneFunctionComponent<DialogButtonProps> = ({
  title = 'ACTION',
  titleStyle,
  type = 'clear',
  ...rest
}) => {
  return (
    <Button
      style={{ marginLeft: 5 }}
      title={title}
      titleStyle={StyleSheet.flatten([styles.buttonTitle, titleStyle])}
      type={type}
      containerStyle={{
        width: 'auto',
      }}
      testID="Dialog__Button"
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  buttonTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
});

DialogButton.displayName = 'Dialog.Button';
