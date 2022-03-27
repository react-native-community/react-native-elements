import React from 'react';
import deepmerge from 'deepmerge';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ThemeConsumer, ThemeProviderProps } from './ThemeProvider';
import { FullTheme } from './theme';
import { lightColors } from './colors';

const isClassComponent = (Component: any) =>
  Boolean(Component?.prototype?.isReactComponent);

export interface ThemedComponent {
  displayName: string;
}

const combineByStyles = (key = '') => {
  if (key.endsWith('style') || key.endsWith('Style')) {
    return (a, b) => {
      return [a, b].flat();
    };
  }
  return undefined;
};

const ThemedComponent = (
  WrappedComponent: any,
  themeKey?: string,
  displayName?: string
) => {
  return Object.assign(
    (props: any, forwardedRef: any) => {
      const { children, ...rest } = props;

      return (
        <ThemeConsumer>
          {(context) => {
            // If user isn't using ThemeProvider
            if (!context) {
              const newProps = {
                ...rest,
                theme: { colors: lightColors },
                children,
              };
              return isClassComponent(WrappedComponent) ? (
                <WrappedComponent ref={forwardedRef} {...newProps} />
              ) : (
                <WrappedComponent {...newProps} />
              );
            }
            const { theme, updateTheme, replaceTheme } = context;

            const themedProps =
              typeof theme[themeKey] === 'function'
                ? theme[themeKey]?.(rest)
                : theme[themeKey];

            const newProps = {
              theme: { colors: theme.colors, mode: theme.mode },
              updateTheme,
              replaceTheme,
              ...deepmerge<FullTheme>(themedProps || {}, rest, {
                customMerge: combineByStyles,
                clone: false,
              }),
              children,
            };

            if (isClassComponent(WrappedComponent)) {
              return <WrappedComponent ref={forwardedRef} {...newProps} />;
            }
            return <WrappedComponent {...newProps} />;
          }}
        </ThemeConsumer>
      );
    },
    { displayName: displayName }
  );
};

function withTheme<P = {}, T = {}>(
  WrappedComponent: React.ComponentType<P & Partial<ThemeProviderProps<T>>>,
  themeKey?: string
): React.FunctionComponent<P> | React.ForwardRefExoticComponent<P> {
  const name = themeKey
    ? `Themed.${themeKey}`
    : `Themed.${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
      }`;

  const Component = ThemedComponent(WrappedComponent, themeKey, name);

  if (isClassComponent(WrappedComponent)) {
    return hoistNonReactStatics(React.forwardRef(Component), WrappedComponent);
  }

  return Component;
}

export default withTheme;
