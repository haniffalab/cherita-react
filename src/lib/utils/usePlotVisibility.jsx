import useMediaQuery from '@mui/material/useMediaQuery';

import { BREAKPOINTS } from '../constants/constants';

export default function usePlotVisibility(isFullscreen) {
  const Lg = useMediaQuery(BREAKPOINTS.LG);
  const Xl = useMediaQuery(BREAKPOINTS.XL);

  const showCategoriesBtn = isFullscreen ? Lg : true;
  const showSearchBtn = isFullscreen ? Xl : true;
  const isCompact = !isFullscreen || Lg;

  return { showCategoriesBtn, showSearchBtn, isCompact };
}
