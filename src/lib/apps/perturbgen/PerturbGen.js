import { useState } from 'react';

import { useMediaQuery } from '@mui/material';
import { Card, Container, Modal } from 'react-bootstrap';

import { ObsExplorer } from './ObsExplorer';
import { ObsColsList } from '../../components/obs-list/ObsList';
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
} from '../../components/offcanvas';
import { PseudospatialToolbar } from '../../components/pseudospatial/PseudospatialToolbar';
import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { ScatterplotControls } from '../../components/scatterplot/ScatterplotControls';
import { SearchBar } from '../../components/search-bar/SearchBar';
import { BREAKPOINTS, SELECTION_MODES } from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';

export function PerturbGen({ ...props }) {
  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
  const LgBreakpoint = useMediaQuery(BREAKPOINTS.LG);
  const XlBreakpoint = useMediaQuery(BREAKPOINTS.XL);
  const showObsBtn = LgBreakpoint;
  const showVarsBtn = XlBreakpoint;

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
              showObsBtn={showObsBtn}
              showVarsBtn={showVarsBtn}
              showCtrlsBtn={true}
              setShowObs={setShowObs}
              setShowVars={setShowVars}
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
          show={showObs}
          handleClose={() => setShowObs(false)}
          {...props}
          showSelectedAsActive={false}
        />
        <OffcanvasVars
          show={showVars}
          handleClose={() => setShowVars(false)}
          mode={SELECTION_MODES.SINGLE}
        />
        <OffcanvasControls
          show={showControls}
          handleClose={() => setShowControls(false)}
          Controls={ScatterplotControls}
        />
        <OffcanvasObsm show={showObsm} handleClose={() => setShowObsm(false)} />
        <OffcanvasControls
          show={showPseudospatialControls}
          handleClose={() => setShowPseudospatialControls(false)}
          Controls={PseudospatialToolbar}
        />
      </DatasetProvider>
    </div>
  );
}
