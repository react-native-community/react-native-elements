import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  ActivityIndicatorProps,
  ActivityIndicator,
  StyleProp,
  View,
} from 'react-native';
import { defaultTheme, RneFunctionComponent } from '../helpers';

export interface DialogLoadingProps {
  /** Add additional styling for loading component. */
  loadingStyle?: StyleProp<ViewStyle>;

  /** Add additional props for ActivityIndicator component */
  loadingProps?: ActivityIndicatorProps;
}

/** `DialogLoader` allows adding loader to the Dialog. Loader is simply ActivityIndicator. */
export const DialogLoading: RneFunctionComponent<DialogLoadingProps> = ({
  loadingStyle,
  loadingProps = { size: 'large' },
  theme = defaultTheme,
}) => {
  return (
    <View style={styles.loadingView}>
      <ActivityIndicator
        style={StyleSheet.flatten([styles.loading, loadingStyle])}
        color={loadingProps?.color ?? theme?.colors?.primary}
        size={loadingProps?.size ?? 'large'}
        testID="Dialog__Loading"
        {...loadingProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    marginVertical: 20,
  },
  loadingView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

DialogLoading.displayName = 'Dialog.Loading';
