import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  StyleProp,
  ViewStyle,
  ModalProps,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RneFunctionComponent } from '../helpers';

export interface BottomSheetProps {
  /** Style of the bottom sheet's container. Use this to change the color of the underlay. */
  containerStyle?: StyleProp<ViewStyle>;

  /** Additional props handed to the `Modal`. */
  modalProps?: ModalProps;

  /** Style of the backdrop container. */
  backdropStyle?: StyleProp<ViewStyle>;

  /** Handler for backdrop press. */
  onBackdropPress?(): void;

  /** Is the modal component shown. */
  isVisible?: boolean;

  /** Used to add props to Scroll view. */
  scrollViewProps?: ScrollViewProps;
}

/**
 * Overlay Modal that displays content from the bottom of the screen.
 * This opens from the bottom of the screen.
 */
export const BottomSheet: RneFunctionComponent<BottomSheetProps> = ({
  containerStyle,
  backdropStyle,
  onBackdropPress = () => null,
  isVisible = false,
  modalProps = {},
  children,
  disableScroll = false,
  scrollViewProps = {},
  ...rest
}) => {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onBackdropPress}
      transparent={true}
      visible={isVisible}
      {...modalProps}
    >
      <Pressable
        onPress={onBackdropPress}
        style={[StyleSheet.absoluteFill, backdropStyle]}
        testID="RNE__Overlay__backdrop"
      />

      <SafeAreaView
        style={StyleSheet.flatten([
          styles.safeAreaView,
          containerStyle && containerStyle,
        ])}
        pointerEvents="box-none"
        {...rest}
      >
          <View>
          {disableScroll ? (
            <View>{children}</View>
          ) : (
            <ScrollView {...scrollViewProps}>{children}</ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'column-reverse',
  },
});

BottomSheet.displayName = 'BottomSheet';
