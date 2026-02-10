import { useState } from 'react';

import { Card, Container, Modal } from 'react-bootstrap';

import {
  OffcanvasControls,
  OffcanvasObsm,
} from '../../components/offcanvas/OffCanvas';
import { PseudospatialToolbar } from '../../components/pseudospatial/PseudospatialToolbar';
import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { ScatterplotControls } from '../../components/scatterplot/ScatterplotControls';
import { SELECTION_MODES } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { useObsSideBar, useObsExplorerSideBar } from '../../utils/hooks';

export function StandardView({ ...props }) {
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);

  const { ObsSideBar, setShowOffcanvas: setShowCategories } = useObsSideBar({
    isFullscreen: true,
    showSelectedAsActive: false,
    showHistograms: true,
    showColor: true,
    ...props,
  });

  const { ObsExplorerSideBar, setShowOffcanvas: setShowObsExplorer } =
    useObsExplorerSideBar({
      isFullscreen: true,
      mode: SELECTION_MODES.SINGLE,
    });

  return (
    <div className="cherita-app">
      <DatasetProvider {...props}>
        <Container fluid className="cherita-app-container">
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsSideBar />
          </div>
          <div className="cherita-app-canvas">
            <Scatterplot
              setShowCategories={setShowCategories}
              setShowSearch={setShowObsExplorer}
              setShowControls={setShowControls}
              isFullscreen={true}
              pointInteractionEnabled={true}
            />
          </div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Body>
                <ObsExplorerSideBar />
              </Card.Body>
            </Card>
          </div>
        </Container>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body></Modal.Body>
        </Modal>
        <OffcanvasControls
          show={showControls}
          handleClose={() => setShowControls(false)}
          Controls={ScatterplotControls}
        />
        <OffcanvasObsm
          show={showEmbeddings}
          handleClose={() => setShowEmbeddings(false)}
        />
        <OffcanvasControls
          show={showPseudospatialControls}
          handleClose={() => setShowPseudospatialControls(false)}
          Controls={PseudospatialToolbar}
        />
      </DatasetProvider>
    </div>
  );
}
