import PropTypes from 'prop-types';
import React from 'react';
import {Image, Platform, StyleSheet, Text as NativeText, View} from 'react-native';
import fonts from '../config/fonts';
import colors from '../config/colors';
import Text from '../text/Text';
import Divider from '../divider/Divider';
import normalize from '../helpers/normalizeText';

const Card = props => {
  const {
    children,
    flexDirection,
    containerStyle,
    wrapperStyle,
    imageWrapperStyle,
    title,
    titleStyle,
    featuredTitle,
    featuredTitleStyle,
    featuredSubtitle,
    featuredSubtitleStyle,
    dividerStyle,
    image,
    imageStyle,
    fontFamily,
    ...attributes
  } = props;

  return (
    <View
      style={[
        styles.container,
        image && { padding: 0 },
        containerStyle && containerStyle,
      ]}
      {...attributes}
    >
      <View
        style={[
          styles.wrapper,
          wrapperStyle && wrapperStyle,
          flexDirection && { flexDirection },
        ]}
      >
        {renderTitle(title, image, titleStyle, fontFamily, dividerStyle)}
        {image &&
          <View style={imageWrapperStyle && imageWrapperStyle}>
            <Image
              resizeMode="cover"
              style={[{ width: null, height: 150 }, imageStyle && imageStyle]}
              source={image}
            >
              <View style={styles.overlayContainer}>
                {renderFeaturedTitle(featuredTitle, featuredTitleStyle, styles.featuredTitle)}
                {renderFeaturedTitle(featuredSubtitle, featuredSubtitleStyle, styles.featuredSubtitle)}
              </View>
            </Image>
            <View style={[{ padding: 10 }, wrapperStyle && wrapperStyle]}>
              {children}
            </View>
          </View>}
        {!image && children}
      </View>
    </View>
  );
};

const renderTitle = (title, image, titleStyle, fontFamily, dividerStyle) => {
  if (!title) {
    return null;
  }

  if (typeof title !== 'object') {
    title = (
      <Text
        style={[
          styles.cardTitle,
          image && styles.imageCardTitle,
          titleStyle && titleStyle,
          fontFamily && {fontFamily},
        ]}
      >
        {title}
      </Text>
    );
  }

  return (
    <View>
      {title}
      {!image &&
      <Divider
        style={[styles.divider, dividerStyle && dividerStyle]}
      />}
    </View>
  );
};

const renderFeaturedTitle = (title, titleStyle, defaultStyle) => {
  if (!title) {
    return null;
  }

  if (typeof title === 'object') {
    return title;
  }

  console.tron.pretty('yes', 'this is happening');
  return (
    <Text style={[defaultStyle, titleStyle && titleStyle]}>
      {title}
    </Text>
  );
};

Card.propTypes = {
  children: PropTypes.any,
  flexDirection: PropTypes.string,
  containerStyle: View.propTypes.style,
  wrapperStyle: View.propTypes.style,
  title: PropTypes.string,
  titleStyle: NativeText.propTypes.style,
  featuredTitle: PropTypes.any,
  featuredTitleStyle: Text.propTypes.style,
  featuredSubtitle: PropTypes.any,
  featuredSubtitleStyle: Text.propTypes.style,
  dividerStyle: View.propTypes.style,
  image: Image.propTypes.source,
  imageStyle: View.propTypes.style,
  imageWrapperStyle: View.propTypes.style,
  fontFamily: PropTypes.string,
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: colors.grey5,
    borderWidth: 1,
    padding: 15,
    margin: 15,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  featuredTitle: {
    fontSize: normalize(18),
    marginBottom: 8,
    color: 'white',
    ...Platform.select({
      ios: {
        fontWeight: '800',
      },
      android: {
        ...fonts.android.black,
      },
    }),
  },
  featuredSubtitle: {
    fontSize: normalize(13),
    marginBottom: 8,
    color: 'white',
    ...Platform.select({
      ios: {
        fontWeight: '400',
      },
      android: {
        ...fonts.android.black,
      },
    }),
  },
  wrapper: {
    backgroundColor: 'transparent',
  },
  divider: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: normalize(14),
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
      android: {
        ...fonts.android.black,
      },
    }),
    textAlign: 'center',
    marginBottom: 15,
    color: colors.grey1,
  },
  imageCardTitle: {
    marginTop: 15,
  },
  overlayContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Card;
