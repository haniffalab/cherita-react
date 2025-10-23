import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Wrapper } from './setupTests';
import { ObsColsList } from '../lib/components/obs-list/ObsList';
import { useFetch } from '../lib/utils/requests';
import { useResolver } from '../lib/utils/Resolver';

test('renders ObsColsList component', () => {
  useResolver.mockImplementation((initSettings) => {
    return initSettings;
  });

  useFetch.mockReturnValue({
    fetchedData: null,
    isPending: true,
    serverError: null,
  });

  render(<ObsColsList />, { wrapper: Wrapper });
  const element = screen.getByRole('progressbar');
  expect(element).toBeInTheDocument();
});

test('fetches data and renders ObsColsList', async () => {
  const mockData = [
    {
      codes: {
        False: 0,
        True: 1,
      },
      n_values: 2,
      name: 'boolean',
      type: 'boolean',
      value_counts: {
        False: 10,
        True: 5,
      },
      values: ['False', 'True'],
    },
  ];

  useFetch.mockReturnValue({
    fetchedData: mockData,
    isPending: false,
    serverError: null,
  });

  render(<ObsColsList />, { wrapper: Wrapper });

  const element = await screen.findByText('boolean');
  expect(element).toBeInTheDocument();
});
