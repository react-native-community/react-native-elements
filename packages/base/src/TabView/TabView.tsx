import React from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  View,
  StyleSheet,
  PanResponderGestureState,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { RneFunctionComponent } from '../helpers';

export interface TabViewBaseProps {
  /** Child position index value. */
  value?: number;

  /** On Index Change Callback. */
  onChange?: (value: number) => any;

  /** Choose the animation type among `spring` and `timing`. This is visible when there is tab change. */
  animationType?: 'spring' | 'timing';

  /** Define the animation configurations.
   *
   * @type AnimationConfig
   */
  animationConfig?: Omit<
    Animated.SpringAnimationConfig & Animated.TimingAnimationConfig,
    'toValue'
  >;

  /** Styling for Component container. */
  containerStyle?: StyleProp<ViewStyle>;

  /** Styling for TabView.Item Component container. */
  tabItemContainerStyle?: StyleProp<ViewStyle>;

  /** Swipe disabled or not */
  disableSwipe?: Boolean;

  /** Disables transition */
  disableTransition?: Boolean;

  /**   */
  onSwipeStart?: (dir: 'left' | 'right') => void;

  minSwipeRatio?: number;

  minSwipeSpeed?: number;
}

/** Tabs organize content across different screens, data sets, and other interactions.
 * TabView enables swipeable tabs. */
export const TabViewBase: RneFunctionComponent<TabViewBaseProps> = ({
  value = 0,
  children,
  onChange = () => {},
  onSwipeStart = () => {},
  animationType = 'spring',
  animationConfig = {},
  containerStyle,
  tabItemContainerStyle,
  disableSwipe = false,
  disableTransition = false,
  minSwipeRatio = 0.4,
  minSwipeSpeed = 1,
}) => {
  const translateX = React.useRef(new Animated.Value(0));
  const panX = React.useRef(value);
  const [containerWidth, setContainerWidth] = React.useState(1);
  const containerWidthRef = React.useRef(1);

  const childCount = React.useMemo(
    () => React.Children.count(children),
    [children]
  );

  const animate = React.useCallback(
    (toValue: number) => {
      Animated[animationType](translateX.current, {
        toValue,
        useNativeDriver: true,
        easing: Easing.ease,
        ...animationConfig,
      }).start();
    },
    [animationConfig, animationType]
  );

  const releaseResponder = React.useCallback(
    (_: GestureResponderEvent, { dx, vx }: PanResponderGestureState) => {
      const position = dx / -containerWidthRef.current;
      const shouldSwipe =
        Math.abs(position) > minSwipeRatio || Math.abs(vx) > minSwipeSpeed;
      panX.current += shouldSwipe ? Math.sign(position) : 0;
      animate(panX.current);
      onChange(panX.current);
    },
    [animate, minSwipeRatio, minSwipeSpeed, onChange]
  );

  const { current: panResponder } = React.useRef(
    PanResponder.create({
      onPanResponderGrant: (_, { vx }) => {
        onSwipeStart(vx > 0 ? 'left' : 'right');
      },
      onMoveShouldSetPanResponder: (_, { dx, dy, vx, vy }) => {
        const panXInt = Math.floor(panX.current);
        return (
          !(
            (dx > 0 && panXInt <= 0) ||
            (dx < 0 && panXInt >= childCount - 1)
          ) &&
          Math.abs(dx) > Math.abs(dy) * 2 &&
          Math.abs(vx) > Math.abs(vy) * 2.5
        );
      },
      onPanResponderMove: (_, { dx }) => {
        const position = dx / -containerWidthRef.current;
        translateX.current.setValue(Math.floor(panX.current) + position);
      },
      onPanResponderRelease: releaseResponder,
      onPanResponderTerminate: releaseResponder,
    })
  );

  React.useEffect(() => {
    if (Number.isInteger(value) && value !== panX.current) {
      animate(value);
      panX.current = value;
    }
  }, [animate, value]);

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={({ nativeEvent: { layout } }) => {
        setContainerWidth(layout.width);
        containerWidthRef.current = layout.width;
      }}
    >
      <Animated.View
        testID="RNE__TabView"
        style={StyleSheet.flatten([
          StyleSheet.absoluteFillObject,
          styles.container,
          {
            width: containerWidth * childCount,
            transform: [
              {
                translateX: disableTransition
                  ? -value * containerWidth
                  : translateX.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -containerWidth],
                    }),
              },
            ],
          },
        ])}
        {...(!disableSwipe && panResponder.panHandlers)}
      >
        {React.Children.map(children, (child) => (
          <View
            style={StyleSheet.flatten([
              styles.container,
              tabItemContainerStyle,
              { width: containerWidth },
            ])}
          >
            {child}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});

TabViewBase.displayName = 'TabView';
