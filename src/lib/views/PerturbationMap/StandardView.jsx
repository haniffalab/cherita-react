import { useState } from 'react';

import { Card, Container, Modal } from 'react-bootstrap';

import { ObsExplorer } from './ObsExplorer';
import { ObsColsList } from '../../components/obs-list/ObsList';
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasObsExplorer,
} from '../../components/offcanvas/OffCanvas';
import { PseudospatialToolbar } from '../../components/pseudospatial/PseudospatialToolbar';
import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { ScatterplotControls } from '../../components/scatterplot/ScatterplotControls';
import { SearchBar } from '../../components/search-bar/SearchBar';
import { SELECTION_MODES } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';

export function StandardView({ ...props }) {
  const [showCategories, setShowCategories] = useState(false);
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [showObsExplorer, setShowObsExplorer] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);

  return (
    <div className="cherita-app">
      <DatasetProvider {...props}>
        <Container fluid className="cherita-app-container">
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList
              {...props}
              showSelectedAsActive={false}
              showHistograms={true}
              showColor={true}
            />
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
                <div className="sidebar-features">
                  <SearchBar
                    searchDiseases={false}
                    searchVar={false}
                    searchObs={true}
                  />
                  <div className="sidebar-features-list">
                    <ObsExplorer />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body></Modal.Body>
        </Modal>
        <OffcanvasObs
          show={showCategories}
          handleClose={() => setShowCategories(false)}
          {...props}
          showSelectedAsActive={false}
        />
        <OffcanvasObsExplorer
          show={showObsExplorer}
          handleClose={() => setShowObsExplorer(false)}
          mode={SELECTION_MODES.SINGLE}
        />
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
