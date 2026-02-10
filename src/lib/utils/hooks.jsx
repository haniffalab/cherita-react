import { useState } from 'react';

import usePlotVisibility from './usePlotVisibility';
import { ObsColsList } from '../components/obs-list/ObsList';
import { OffcanvasObs, OffcanvasVars } from '../components/offcanvas/OffCanvas';
import { SearchBar } from '../components/search-bar/SearchBar';
import { VarNamesList } from '../components/var-list/VarList';

export const useObsSideBar = ({ isFullscreen, ...props }) => {
  const { showCategoriesBtn } = usePlotVisibility(isFullscreen);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const ObsSideBar = () => (
    <>
      <ObsColsList {...props} />
      <OffcanvasObs
        {...props}
        show={showOffcanvas}
        handleClose={() => setShowOffcanvas(false)}
      />
    </>
  );

  return { ObsSideBar, showCategoriesBtn, setShowOffcanvas };
};

export const useVarSideBar = ({ isFullscreen, ...props }) => {
  const { showSearchBtn } = usePlotVisibility(isFullscreen);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const VarSideBar = () => (
    <>
      <div className="sidebar-features">
        <SearchBar {...props} />
        <div className="sidebar-features-list">
          <VarNamesList {...props} />
        </div>
      </div>
      <OffcanvasVars
        {...props}
        show={showOffcanvas}
        handleClose={() => setShowOffcanvas(false)}
      />
    </>
  );

  return { VarSideBar, showSearchBtn, setShowOffcanvas };
};
