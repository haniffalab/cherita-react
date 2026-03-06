import { useState, useMemo, useCallback } from 'react';

import { Card, Container, ToggleButton } from 'react-bootstrap';

import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { COLOR_ENCODINGS, INITIAL_VIEW_STATE } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { useObsSideBar, useVarSideBar } from '../../utils/hooks';

const SyncButton = ({ isSynced, toggleSync }) => (
  <ToggleButton
    type="checkbox"
    checked={isSynced}
    onClick={toggleSync}
    variant="outline-primary"
  >
    {isSynced ? 'Unfollow view' : 'Follow view'}
  </ToggleButton>
);

const ObsView = ({ viewState, onViewStateChange, children, ...props }) => {
  const {
    ObsSideBar,
    showCategoriesBtn,
    setShowOffcanvas: setShowCategories,
  } = useObsSideBar({ isFullscreen: true, ...props });

  const memoizedObsSideBar = useMemo(() => <ObsSideBar />, []);

  return (
    <DatasetProvider
      {...props}
      canOverrideSettings={false}
      defaultSettings={{ colorEncoding: COLOR_ENCODINGS.OBS }}
    >
      <div className="cherita-app-obs modern-scrollbars border-end h-100">
        {memoizedObsSideBar}
      </div>
      <div className="cherita-app-canvas">
        {children}
        <Scatterplot
          {...props}
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          showCategoriesBtn={showCategoriesBtn}
          setShowCategories={setShowCategories}
        />
      </div>
    </DatasetProvider>
  );
};

const VarView = ({ viewState, onViewStateChange, children, ...props }) => {
  const {
    VarSideBar,
    showSearchBtn,
    setShowOffcanvas: setShowSearch,
  } = useVarSideBar({ isFullscreen: true, ...props });

  const memoizedVarSideBar = useMemo(() => <VarSideBar />, []);

  return (
    <DatasetProvider
      {...props}
      canOverrideSettings={false}
      defaultSettings={{ colorEncoding: COLOR_ENCODINGS.VAR }}
    >
      <div className="cherita-app-canvas">
        {children}
        <Scatterplot
          {...props}
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          showSearchBtn={showSearchBtn}
          setShowSearch={setShowSearch}
        />
      </div>
      <div className="cherita-app-sidebar p-3">
        <Card>
          <Card.Body>{memoizedVarSideBar}</Card.Body>
        </Card>
      </div>
    </DatasetProvider>
  );
};

export function SplitView(props) {
  const [isSynced, setIsSynced] = useState(true);
  const [syncedViewState, setSyncedViewState] = useState(INITIAL_VIEW_STATE);

  const [obsViewState, setObsViewState] = useState(INITIAL_VIEW_STATE);
  const [varViewState, setVarViewState] = useState(INITIAL_VIEW_STATE);

  const toggleSyncViewState = useCallback(
    (viewState) => {
      if (isSynced) {
        setIsSynced(false);
      } else {
        setSyncedViewState(viewState);
        setIsSynced(true);
      }
    },
    [isSynced],
  );

  const onObsViewStateChange = useCallback(
    (viewState) => {
      setObsViewState(viewState);
      setSyncedViewState(viewState);
      if (isSynced) {
        setVarViewState(viewState);
      }
    },
    [isSynced],
  );

  const onVarViewStateChange = useCallback(
    (viewState) => {
      setVarViewState(viewState);
      setSyncedViewState(viewState);
      if (isSynced) {
        setObsViewState(viewState);
      }
    },
    [isSynced],
  );

  return (
    <>
      <div className="cherita-app">
        <Container fluid className="cherita-app-container">
          <ObsView
            {...props}
            showSearchBtn={false}
            viewState={isSynced ? syncedViewState : obsViewState}
            onViewStateChange={onObsViewStateChange}
          >
            <div>
              <SyncButton
                isSynced={isSynced}
                toggleSync={() => toggleSyncViewState(obsViewState)}
              />
            </div>
          </ObsView>
          <VarView
            {...props}
            showCategoriesBtn={false}
            viewState={isSynced ? syncedViewState : varViewState}
            onViewStateChange={onVarViewStateChange}
          >
            <div>
              <SyncButton
                isSynced={isSynced}
                toggleSync={() => toggleSyncViewState(varViewState)}
              />
            </div>
          </VarView>
        </Container>
      </div>
    </>
  );
}
