import { useQuery } from '@tanstack/react-query';

export const useNCBIData = ({ symbol }) => {
  const {
    data: fetchedData = null,
    isLoading: isPending,
    error: serverError,
  } = useQuery({
    queryKey: ['ncbiData', symbol],
    queryFn: async () => {
      const response = await fetch(
        `https://api.ncbi.nlm.nih.gov/datasets/v2/gene/symbol/${symbol}/taxon/human?page_size=1`,
        { method: 'GET' },
      );

      if (!response.ok) {
        throw new Error('Error fetching NCBI data');
      }

      return response.json();
    },
    enabled: Boolean(symbol),
  });

  return { fetchedData, isPending, serverError };
};
