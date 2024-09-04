import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  Platform,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
} from 'react-native';
import { RneFunctionComponent } from '../helpers';
import { Rect } from './components/Rect';
import { SliderThumb } from './components/SliderThumb';

const TRACK_SIZE = 4;
const THUMB_SIZE = 40;
const TRACK_STYLE = Platform.select({ web: 0, default: -1 });
const DEFAULT_ANIMATION_CONFIGS = {
  spring: {
    friction: 7,
    tension: 100,
    useNativeDriver: true,
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
    delay: 0,
    useNativeDriver: true,
  },
};

// return a value bounded to min/max
const getBoundedValue = (
  value: number,
  maximumValue: number,
  minimumValue: number
) => Math.max(Math.min(value, maximumValue), minimumValue);

// define handler functions not related to props or state

// Should we allow another component to take over this pan?
const handlePanResponderRequestEnd = () => false;

// Should we become active when the user moves a touch over the thumb?
const handleMoveShouldSetPanResponder = () => !TRACK_STYLE;

type Sizable = {
  width: number;
  height: number;
};

// enum to track vars that contain Sizable structures (used by handleMeasure)
enum SizableVars {
  containerSize = 'containerSize',
  thumbSize = 'thumbSize',
  trackSize = 'trackSize',
}

// enum to track event types
enum EventTypes {
  onSlidingStart = 'onSlidingStart',
  onValueChange = 'onValueChange',
  onSlidingComplete = 'onSlidingComplete',
}

export interface SliderProps {
  /** Initial value of the slider. */
  value?: number;

  /** If true the user won't be able to move the slider. */
  disabled?: boolean;

  /** Initial minimum value of the slider. */
  minimumValue?: number;

  /** Initial maximum value of the slider. */
  maximumValue?: number;

  /** Step value of the slider. The value should be between 0 and maximumValue - minimumValue). */
  step?: number;

  /** The color used for the track to the left of the button. */
  minimumTrackTintColor?: string;

  /** The color used for the track to the right of the button. */
  maximumTrackTintColor?: string;

  /** If true, thumb will respond and jump to any touch along the track. */
  allowTouchTrack?: boolean;

  /** The color used for the thumb. */
  thumbTintColor?: string;

  /** The size of the touch area that allows moving the thumb. The touch area has the same center as the visible thumb. This allows to have a visually small thumb while still allowing the user to move it easily. */
  thumbTouchSize?: Sizable;

  /** Callback continuously called while the user is dragging the slider. */
  onValueChange?(value: number): void;

  /** Callback called when the user starts changing the value (e.g. when the slider is pressed). */
  onSlidingStart?(value: number): void;

  /** Callback called when the user finishes changing the value (e.g. when the slider is released). */
  onSlidingComplete?(value: number): void;

  /** The style applied to the slider container. */
  style?: StyleProp<ViewStyle>;

  /** The style applied to the track. */
  trackStyle?: StyleProp<ViewStyle>;

  /** The style applied to the thumb. */
  thumbStyle?: StyleProp<ViewStyle>;

  /** The props applied to the thumb. Uses `Component` prop which can accept `Animated` components. */
  thumbProps?: any;

  /** Set this to true to visually see the thumb touch rect in green. */
  debugTouchArea?: boolean;

  /** Set to true if you want to use the default 'spring' animation. */
  animateTransitions?: boolean;

  /** Set to 'spring' or 'timing' to use one of those two types of animations with the default [animation properties](https://reactnative.dev/docs/animations.html). */
  animationType?: 'spring' | 'timing';

  /** Set the orientation of the slider. */
  orientation?: 'horizontal' | 'vertical';

  /** Used to configure the animation parameters. These are the same parameters in the [Animated library](https://reactnative.dev/docs/animations.html). */
  animationConfig?:
    | Animated.TimingAnimationConfig
    | Animated.SpringAnimationConfig;

  /** Apply style to the container of the slider.
   * @type Style
   */
  containerStyle?: typeof styles;
}

/** Sliders allow users to select a value from a fixed set of values using drag utility.*/
export const Slider: RneFunctionComponent<SliderProps> = ({
  allowTouchTrack = false,
  animateTransitions,
  animationConfig,
  animationType = 'timing',
  containerStyle,
  debugTouchArea = false,
  disabled,
  maximumTrackTintColor = '#b3b3b3',
  maximumValue = 1,
  minimumTrackTintColor = '#3f3f3f',
  minimumValue = 0,
  onSlidingComplete,
  onSlidingStart,
  onValueChange,
  orientation = 'horizontal',
  step = 0,
  style,
  thumbProps,
  thumbStyle,
  thumbTintColor = 'red',
  thumbTouchSize = { height: THUMB_SIZE, width: THUMB_SIZE },
  trackStyle,
  value: _propValue = 0,
  ...other
}) => {
  const propValue = getBoundedValue(_propValue, maximumValue, minimumValue);
  const prevPropValue = useRef(propValue);
  const animatedValue = useRef(new Animated.Value(propValue));
  const _previousLeft = useRef(0);
  const gestureStartPosition = useRef(0);
  const [allMeasured, setAllMeasured] = useState(false);
  const [containerSize, setContainerSize] = useState<Sizable>({
    width: 0,
    height: 0,
  });
  const [trackSize, setTrackSize] = useState<Sizable>({ width: 0, height: 0 });
  const [thumbSize, setThumbSize] = useState<Sizable>({ width: 0, height: 0 });
  const isVertical = orientation === 'vertical';

  // update size rect for given variable
  const handleMeasure = useCallback(
    (name: SizableVars, event: LayoutChangeEvent) => {
      // get current value and setter for the appropriate variable
      const varInfo = {
        containerSize: { size: containerSize, setSize: setContainerSize },
        thumbSize: { size: thumbSize, setSize: setThumbSize },
        trackSize: { size: trackSize, setSize: setTrackSize },
      };
      const { size, setSize } = varInfo[name];

      // update the var's size, adjusting for horizontal/vertical
      const rect = event.nativeEvent.layout;
      const rectWidth = rect?.width ?? size.width;
      const rectHeight = rect?.height ?? size.height;
      const newSize = {
        height: isVertical ? rectWidth : rectHeight,
        width: isVertical ? rectHeight : rectWidth,
      };
      setSize(newSize);
    },
    [containerSize, isVertical, thumbSize, trackSize]
  );

  // use an effect to update allMeasured when sizes change
  useEffect(
    () =>
      setAllMeasured(
        !!(
          containerSize.height &&
          containerSize.width &&
          thumbSize.height &&
          thumbSize.width &&
          trackSize.height &&
          trackSize.width
        )
      ),
    [
      containerSize.height,
      containerSize.width,
      thumbSize.height,
      thumbSize.width,
      trackSize.height,
      trackSize.width,
    ]
  );

  const measureContainer = useCallback(
    (event) => handleMeasure(SizableVars.containerSize, event),
    [handleMeasure]
  );
  const measureTrack = useCallback(
    (event) => handleMeasure(SizableVars.trackSize, event),
    [handleMeasure]
  );
  const measureThumb = useCallback(
    (event) => handleMeasure(SizableVars.thumbSize, event),
    [handleMeasure]
  );

  // set the current animation value
  const setCurrentValue = useCallback(
    (v: number) => animatedValue.current.setValue(v),
    [animatedValue]
  );

  // animate to the new value
  const setCurrentValueAnimated = useCallback(
    (v: number) =>
      Animated[animationType](animatedValue.current, {
        ...DEFAULT_ANIMATION_CONFIGS[animationType],
        ...animationConfig,
        toValue: v,
      }).start(),
    [animationConfig, animationType]
  );

  // update animation values if props.value changed
  useEffect(() => {
    // if value prop changed, we need to update
    if (prevPropValue.current !== propValue) {
      prevPropValue.current = propValue;
      if (animateTransitions) {
        setCurrentValueAnimated(propValue);
      } else {
        setCurrentValue(propValue);
      }
    }
  }, [
    animateTransitions,
    maximumValue,
    minimumValue,
    setCurrentValue,
    setCurrentValueAnimated,
    propValue,
  ]);

  const getValueForTouch = useCallback(
    (location: number) => {
      const length = containerSize.width - thumbSize.width;
      const ratio = location / length;
      let newValue = ratio * (maximumValue - minimumValue);
      if (step) {
        newValue = Math.round(newValue / step) * step;
      }
      return getBoundedValue(
        newValue + minimumValue,
        maximumValue,
        minimumValue
      );
    },
    [containerSize.width, maximumValue, minimumValue, step, thumbSize.width]
  );

  const getThumbLeft = useCallback(
    (v: number) => {
      const ratio = (v - minimumValue) / (maximumValue - minimumValue);
      return ratio * (containerSize.width - thumbSize.width);
    },
    [containerSize.width, maximumValue, minimumValue, thumbSize.width]
  );

  const getTouchOverflowSize = useCallback(
    (): Sizable =>
      allMeasured
        ? {
            height: Math.max(0, thumbTouchSize.height - containerSize.height),
            width: Math.max(0, thumbTouchSize.width - thumbSize.width),
          }
        : { height: 0, width: 0 },
    [
      allMeasured,
      containerSize.height,
      thumbSize.width,
      thumbTouchSize.height,
      thumbTouchSize.width,
    ]
  );

  const getCurrentValue = useCallback(
    () => (animatedValue.current as any).__getValue(),
    []
  );

  const getThumbTouchRect = useCallback(() => {
    const touchOverflowSize: Sizable = getTouchOverflowSize();
    const height =
      touchOverflowSize.height / 2 +
      (containerSize.height - thumbTouchSize.height) / 2;
    const width =
      touchOverflowSize.width / 2 +
      getThumbLeft(getCurrentValue()) +
      (thumbSize.width - thumbTouchSize.width) / 2;
    return isVertical
      ? new Rect(height, width, thumbTouchSize.width, thumbTouchSize.height)
      : new Rect(width, height, thumbTouchSize.width, thumbTouchSize.height);
  }, [
    containerSize.height,
    getCurrentValue,
    getThumbLeft,
    getTouchOverflowSize,
    isVertical,
    thumbSize.width,
    thumbTouchSize.height,
    thumbTouchSize.width,
  ]);

  // get value of where some touched on slider.
  const getOnTouchValue = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      const { width: thumbWidth, height: thumbHeight } = getThumbTouchRect();
      const location = isVertical
        ? nativeEvent.locationY - thumbHeight / 2
        : nativeEvent.locationX - thumbWidth / 2;
      return getValueForTouch(location);
    },
    [getValueForTouch, isVertical, getThumbTouchRect]
  );

  const getValue = useCallback(
    (gestureState: PanResponderGestureState) => {
      const delta =
        (isVertical ? gestureState.moveY : gestureState.moveX) -
        gestureStartPosition.current;
      const location = _previousLeft.current + delta;
      return getValueForTouch(location);
    },
    [getValueForTouch, isVertical]
  );

  const fireChangeEvent = useCallback(
    (event: EventTypes) => {
      const v = getCurrentValue();
      if (event === EventTypes.onSlidingStart) {
        onSlidingStart?.(v);
      } else if (event === EventTypes.onSlidingComplete) {
        onSlidingComplete?.(v);
      } else if (event === EventTypes.onValueChange) {
        onValueChange?.(v);
      }
    },
    [getCurrentValue, onSlidingComplete, onSlidingStart, onValueChange]
  );

  const handlePanResponderGrant = useCallback(
    (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      _previousLeft.current = getThumbLeft(getCurrentValue());
      gestureStartPosition.current = isVertical
        ? gestureState.y0
        : gestureState.x0;
      fireChangeEvent(EventTypes.onSlidingStart);
    },
    [fireChangeEvent, getCurrentValue, getThumbLeft, isVertical]
  );

  const handlePanResponderMove = useCallback(
    (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!disabled) {
        setCurrentValue(getValue(gestureState));
        fireChangeEvent(EventTypes.onValueChange);
      }
    },
    [disabled, fireChangeEvent, getValue, setCurrentValue]
  );

  const handlePanResponderEnd = useCallback(() => {
    if (!disabled) {
      fireChangeEvent(EventTypes.onSlidingComplete);
    }
  }, [disabled, fireChangeEvent]);

  const thumbHitTest = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      const thumbTouchRect = getThumbTouchRect();
      return thumbTouchRect.containsPoint(
        nativeEvent.locationX,
        nativeEvent.locationY
      );
    },
    [getThumbTouchRect]
  );

  const handleStartShouldSetPanResponder = useCallback(
    (e: GestureResponderEvent /* gestureState: Object */) => {
      // If the user presses on the thumb, become active
      const thumbHit = thumbHitTest(e);
      if (thumbHit) {
        return true;
      } else if (allowTouchTrack) {
        setCurrentValue(getOnTouchValue(e));
        fireChangeEvent(EventTypes.onValueChange);
        return true;
      } else {
        return false;
      }
    },
    [
      allowTouchTrack,
      fireChangeEvent,
      getOnTouchValue,
      setCurrentValue,
      thumbHitTest,
    ]
  );

  const getTouchOverflowStyle = useCallback(() => {
    const { width, height } = getTouchOverflowSize();
    const touchOverflowStyle: ViewStyle = {};
    const verticalMargin = -height / 2;
    touchOverflowStyle.marginTop = verticalMargin;
    touchOverflowStyle.marginBottom = verticalMargin;
    const horizontalMargin = -width / 2;
    touchOverflowStyle.marginLeft = horizontalMargin;
    touchOverflowStyle.marginRight = horizontalMargin;
    if (debugTouchArea === true) {
      touchOverflowStyle.backgroundColor = 'orange';
      touchOverflowStyle.opacity = 0.5;
    }
    return touchOverflowStyle;
  }, [debugTouchArea, getTouchOverflowSize]);

  const renderDebugThumbTouchRect = useCallback(
    (thumbLeft: Animated.AnimatedInterpolation) => {
      const thumbTouchRect = getThumbTouchRect();
      const positionStyle = {
        left: thumbLeft,
        top: thumbTouchRect.y,
        width: thumbTouchRect.width,
        height: thumbTouchRect.height,
      };

      return <Animated.View style={positionStyle} pointerEvents="none" />;
    },
    [getThumbTouchRect]
  );

  const getMinimumTrackStyles = useCallback(
    (thumbStart: Animated.Animated) => {
      const minimumTrackStyle: StyleProp<any> = {
        position: 'absolute',
        transformOrigin: 'left top',
        borderRadius: 0,
      };
      if (!allMeasured) {
        minimumTrackStyle.height = 0;
        minimumTrackStyle.width = 0;
      } else if (isVertical) {
        minimumTrackStyle.height = 1;
        minimumTrackStyle.transform = [
          { scaleY: Animated.add(thumbStart, thumbSize.height / 2) },
        ];
      } else {
        minimumTrackStyle.width = 1;
        minimumTrackStyle.transform = [
          { scaleX: Animated.add(thumbStart, thumbSize.width / 2) },
        ];
      }
      return minimumTrackStyle;
    },
    [allMeasured, isVertical, thumbSize.height, thumbSize.width]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: handleMoveShouldSetPanResponder,
        onPanResponderGrant: handlePanResponderGrant,
        onPanResponderMove: handlePanResponderMove,
        onPanResponderRelease: handlePanResponderEnd,
        onPanResponderTerminationRequest: handlePanResponderRequestEnd,
        onPanResponderTerminate: handlePanResponderEnd,
      }),
    [
      handleStartShouldSetPanResponder,
      handlePanResponderGrant,
      handlePanResponderMove,
      handlePanResponderEnd,
    ]
  );

  const mainStyles = containerStyle ?? styles;
  const appliedTrackStyle = StyleSheet.flatten([styles.track, trackStyle]);
  const thumbStart = animatedValue.current.interpolate({
    inputRange: [minimumValue, maximumValue],
    outputRange: [0, containerSize.width - thumbSize.width],
  });
  const minimumTrackStyle = {
    ...getMinimumTrackStyles(thumbStart),
    backgroundColor: minimumTrackTintColor,
  };
  const touchOverflowStyle = getTouchOverflowStyle();

  return (
    <View
      testID="RNE__Slider_Container"
      {...other}
      style={StyleSheet.flatten([
        isVertical
          ? mainStyles.containerVertical
          : mainStyles.containerHorizontal,
        style,
      ])}
      onLayout={measureContainer}
      accessibilityRole="adjustable"
      accessibilityValue={{
        min: minimumValue,
        max: maximumValue,
        now: getCurrentValue(),
      }}
    >
      <View
        testID="RNE__Slider_Track_maximum"
        style={StyleSheet.flatten([
          mainStyles.track,
          isVertical ? mainStyles.trackVertical : mainStyles.trackHorizontal,
          appliedTrackStyle,
          { backgroundColor: maximumTrackTintColor, overflow: 'hidden' },
        ])}
        onLayout={measureTrack}
      >
        <Animated.View
          testID="RNE__Slider_Track_minimum"
          style={StyleSheet.flatten([
            isVertical ? mainStyles.trackVertical : mainStyles.trackHorizontal,
            appliedTrackStyle,
            minimumTrackStyle,
          ])}
        />
      </View>
      <SliderThumb
        isVisible={allMeasured}
        onLayout={measureThumb}
        style={thumbStyle}
        color={thumbTintColor}
        start={thumbStart}
        vertical={isVertical}
        {...thumbProps}
      />
      <View
        testID="RNE__Slider_TouchArea"
        style={StyleSheet.flatten([styles.touchArea, touchOverflowStyle])}
        {...panResponder.panHandlers}
      >
        {debugTouchArea === true && renderDebugThumbTouchRect(thumbStart)}
      </View>
    </View>
  );
};

Slider.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  minimumTrackTintColor: '#3f3f3f',
  maximumTrackTintColor: '#b3b3b3',
  allowTouchTrack: false,
  thumbTintColor: 'red',
  thumbTouchSize: { width: THUMB_SIZE, height: THUMB_SIZE },
  debugTouchArea: false,
  animationType: 'timing',
  orientation: 'horizontal',
};

const styles = StyleSheet.create({
  containerHorizontal: {
    height: 40,
    justifyContent: 'center',
  },
  containerVertical: {
    width: 40,
    flexDirection: 'column',
    alignItems: 'center',
  },
  track: {
    borderRadius: TRACK_SIZE / 2,
  },
  trackHorizontal: {
    height: TRACK_SIZE,
  },
  trackVertical: {
    flex: 1,
    width: TRACK_SIZE,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  },
});

Slider.displayName = 'Slider';
