import { useState, useMemo, useCallback } from 'react';

import { Button, ButtonGroup, Card, Container } from 'react-bootstrap';

import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { COLOR_ENCODINGS, INITIAL_VIEW_STATE } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { useObsSideBar, useVarSideBar } from '../../utils/hooks';

const ObsView = ({ viewState, onViewStateChange, ...props }) => {
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

const VarView = ({ viewState, onViewStateChange, ...props }) => {
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

  const handleSyncToggle = () => {
    setIsSynced((prev) => !prev);
  };

  const onObsViewStateChange = useCallback(
    (newViewState) => {
      setObsViewState(newViewState);
      setSyncedViewState(newViewState);
      if (isSynced) {
        setVarViewState(newViewState);
      }
    },
    [isSynced],
  );

  const onVarViewStateChange = useCallback(
    (newViewState) => {
      setVarViewState(newViewState);
      setSyncedViewState(newViewState);
      if (isSynced) {
        setObsViewState(newViewState);
      }
    },
    [isSynced],
  );

  return (
    <>
      <div className="cherita-app">
        <div className="w-100 d-flex justify-content-center mb-2">
          <ButtonGroup>
            <Button onClick={handleSyncToggle}>
              {isSynced ? 'Unsync View States' : 'Sync View States'}
            </Button>
            {/* <Button onClick={handleSyncToggle}>
              {isSynced ? 'Unsync View States' : 'Sync View States'}
            </Button> */}
          </ButtonGroup>
        </div>
        <Container fluid className="cherita-app-container">
          <ObsView
            {...props}
            showSearchBtn={false}
            viewState={isSynced ? syncedViewState : obsViewState}
            onViewStateChange={onObsViewStateChange}
          />
          <VarView
            {...props}
            showCategoriesBtn={false}
            viewState={isSynced ? syncedViewState : varViewState}
            onViewStateChange={onVarViewStateChange}
          />
        </Container>
      </div>
    </>
  );
}
