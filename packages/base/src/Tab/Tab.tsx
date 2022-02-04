import React from 'react';
import {
  View,
  Animated,
  StyleProp,
  ViewStyle,
  ViewProps,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { defaultTheme, RneFunctionComponent } from '../helpers';
import { TabItemProps } from './Tab.Item';

export type TabBaseProps = ViewProps & {
  /** Child position index value. */
  value?: number;

  /** Makes Tab Scrolling */
  tabScrolling?: boolean;

  /** On Index Change Callback. */
  onChange?: (value: number) => void;

  /** Disable the indicator below. */
  disableIndicator?: boolean;

  /** Additional styling for tab indicator. */
  indicatorStyle?: StyleProp<ViewStyle>;

  /** Define the background Variant. */
  variant?: 'primary' | 'default';
};

/** Tabs organize content across different screens, data sets, and other interactions. */
export const TabBase: RneFunctionComponent<TabBaseProps> = ({
  theme = defaultTheme,
  children,
  value,
  tabScrolling,
  onChange = () => {},
  indicatorStyle,
  disableIndicator,
  variant,
  ...rest
}) => {
  const [dim, setDim] = React.useState({ width: 0 });
  const [childCoords, setChildCoords] = React.useState([]);
  const [tabXPosition, setTabXPosition] = React.useState(null);
  const [scrollViewRef, setScrollViewRef] = React.useState(null);
  const { current: animation } = React.useRef(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: value as number,
      useNativeDriver: true,
      duration: 170,
    }).start();

    scrollHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, value]);

  const scrollHandler = () => {
    if (tabScrolling && childCoords.length > value) {
      let start = value === 0 ? 0 : childCoords[value - 1];
      let end = childCoords[value];
      let scrollX = 0;
      if (start < tabXPosition) {
        scrollX = start - tabXPosition;
      } else if (tabXPosition + dim.width < end) {
        scrollX = end - (tabXPosition + dim.width);
      }
      scrollX += tabXPosition;
      setTabXPosition(scrollX);
      scrollViewRef.scrollTo({
        x: scrollX,
        y: 0,
        animated: true,
      });
    }
  };

  const WIDTH = dim.width / React.Children.count(children);

  return (
    <>
      <View
        {...rest}
        accessibilityRole="tablist"
        style={[
          styles.viewStyle,
          variant === 'primary' && {
            backgroundColor: theme?.colors?.primary,
          },
        ]}
        onLayout={({ nativeEvent: { layout } }) => setDim(Object(layout))}
      >
        {tabScrolling ? (
          <ScrollView
            onScroll={(event) => {
              setTabXPosition(event.nativeEvent.contentOffset.x);
            }}
            ref={(ref) => setScrollViewRef(ref)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {React.Children.map(children, (child, index) => {
              return React.cloneElement(
                child as React.ReactElement<TabItemProps>,
                {
                  onPress: () => onChange(index),
                  onLayout: (event) => {
                    const layout = event.nativeEvent.layout;
                    childCoords[index] =
                      index === 0
                        ? layout.width
                        : childCoords[index - 1] + layout.width;
                    setChildCoords(childCoords);
                  },
                  active: index === value,
                  variant,
                }
              );
            })}
          </ScrollView>
        ) : (
          React.Children.map(children, (child, index) => {
            return React.cloneElement(
              child as React.ReactElement<TabItemProps>,
              {
                onPress: () => onChange(index),
                active: index === value,
                variant,
              }
            );
          })
        )}

        {!disableIndicator && !tabScrolling && (
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: theme?.colors?.secondary,
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, WIDTH],
                    }),
                  },
                ],
              },
              indicatorStyle,
            ]}
          >
            <View style={{ width: WIDTH }} />
          </Animated.View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  titleStyle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  containerStyle: {
    flex: 1,
    borderRadius: 0,
  },
  viewStyle: {
    flexDirection: 'row',
    position: 'relative',
  },
  indicator: {
    display: 'flex',
    position: 'absolute',
    height: 2,
    bottom: 0,
  },
});

TabBase.displayName = 'Tab';
