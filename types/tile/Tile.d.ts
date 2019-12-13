import React from 'react';
declare type TileProps = {
    title?: string;
    icon?: object;
    caption?: React.ReactNode;
    imageSrc?: any;
    onPress?: (...args: any[]) => any;
    activeOpacity?: number;
    containerStyle?: any;
    imageContainerStyle?: any;
    iconContainerStyle?: any;
    overlayContainerStyle?: any;
    titleStyle?: any;
    captionStyle?: any;
    width?: number;
    height?: number;
    featured?: boolean;
    contentContainerStyle?: any;
    titleNumberOfLines?: number;
    imageProps?: object;
    ImageComponent?: JSX.Element;
};
declare const Tile: React.SFC<TileProps>;
export { Tile };
declare const _default: any;
export default _default;
