import React from 'react';
import { Text } from 'react-native';
import Dialog from '..';
import { FullTheme } from '../..';
import { renderWithWrapper } from '../../../.ci/testHelper';

describe('Dialog Component', () => {
  it('should render without any children', () => {
    const component = renderWithWrapper(<Dialog isVisible />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render with title', () => {
    const { queryByText, queryByTestId } = renderWithWrapper(
      <Dialog isVisible>
        <Dialog.Title title="Dialog Title" />
        <Text testID="text">This is a test dialog</Text>
      </Dialog>
    );
    expect(queryByText('Dialog Title')).not.toBeNull();
    expect(queryByTestId('text').props.children).toBe('This is a test dialog');
  });

  it('should render without buttons', () => {
    const { wrapper } = renderWithWrapper(
      <Dialog isVisible>
        <Text>This is a test dialog</Text>
        <Dialog.Actions>
          <Dialog.Button />
        </Dialog.Actions>
      </Dialog>,
      'Dialog__Button'
    );
    expect(wrapper).not.toBeNull();
  });

  it('shows when isVisible is true', () => {
    const { wrapper } = renderWithWrapper(
      <Dialog isVisible>
        <Text>This is a test dialog</Text>
      </Dialog>,
      'Internal__Overlay'
    );
    // Modal Prop
    expect(wrapper.props.visible).toBeTruthy();
  });

  it('should not show when isVisible is false', () => {
    const { wrapper } = renderWithWrapper(
      <Dialog isVisible={false}>
        <Text>This is a test dialog</Text>
      </Dialog>,
      'Internal__Overlay'
    );
    expect(wrapper.props.visible).toBeFalsy();
  });

  it('should apply values from theme', () => {
    const theme: Partial<FullTheme> = {
      Dialog: {
        transparent: false,
      },
    };
    const { wrapper } = renderWithWrapper(
      <Dialog isVisible />,
      'Internal__Overlay',
      theme
    );
    expect(wrapper.props.transparent).toBeFalsy();
  });
});
