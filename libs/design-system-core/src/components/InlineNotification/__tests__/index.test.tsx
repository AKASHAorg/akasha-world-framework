import * as React from 'react';
import InlineNotification from '../';
import { screen } from '@testing-library/react';
import { customRender } from '../../../test-utils';

describe('<InlineNotification /> Component', () => {
  const message = 'Message';

  it('renders correctly', () => {
    customRender(<InlineNotification message={message} type="error" />, {});
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
