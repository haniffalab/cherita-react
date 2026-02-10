import { Card, Container } from 'react-bootstrap';

import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { COLOR_ENCODINGS } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { useObsSideBar, useVarSideBar } from '../../utils/hooks';

const ObsView = (props) => {
  const {
    ObsSideBar,
    showCategoriesBtn,
    setShowOffcanvas: setShowCategories,
  } = useObsSideBar({ isFullscreen: true, ...props });

  return (
    <DatasetProvider
      {...props}
      canOverrideSettings={false}
      defaultSettings={{ colorEncoding: COLOR_ENCODINGS.OBS }}
    >
      <div className="cherita-app-obs modern-scrollbars border-end h-100">
        <ObsSideBar />
      </div>
      <div className="cherita-app-canvas">
        <Scatterplot
          {...props}
          showCategoriesBtn={showCategoriesBtn}
          setShowCategories={setShowCategories}
        />
      </div>
    </DatasetProvider>
  );
};

const VarView = (props) => {
  const {
    VarSideBar,
    showSearchBtn,
    setShowOffcanvas: setShowSearch,
  } = useVarSideBar({ isFullscreen: true, ...props });

  return (
    <DatasetProvider
      {...props}
      canOverrideSettings={false}
      defaultSettings={{ colorEncoding: COLOR_ENCODINGS.VAR }}
    >
      <div className="cherita-app-canvas">
        <Scatterplot
          {...props}
          showSearchBtn={showSearchBtn}
          setShowSearch={setShowSearch}
        />
      </div>
      <div className="cherita-app-sidebar p-3">
        <Card>
          <Card.Body>
            <VarSideBar />
          </Card.Body>
        </Card>
      </div>
    </DatasetProvider>
  );
};

export function SplitView(props) {
  return (
    <div className="cherita-app">
      <Container fluid className="cherita-app-container">
        <ObsView {...props} showSearchBtn={false} />
        <VarView {...props} showCategoriesBtn={false} />
      </Container>
    </div>
  );
}
