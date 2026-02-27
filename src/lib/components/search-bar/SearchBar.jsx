import { useState, useRef, useCallback, useMemo } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import _ from 'lodash';
import { Button, Form, FormGroup, InputGroup, Modal } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

import { DiseaseInfo, VarInfo } from './SearchInfo';
import {
  DiseasesSearchResults,
  ObsSearchResults,
  VarSearchResults,
} from './SearchResults';
import { COLOR_ENCODINGS } from '../../constants/constants';

function useVarSelect() {
  const pendingVars = useRef([]);

  const debouncedSelect = useMemo(
    () =>
      _.debounce((dispatch) => {
        const vars = [...pendingVars.current];
        pendingVars.current = [];

        dispatch({
          type: 'select.multivar.batch',
          vars: vars,
        });

        const lastItem = vars[vars.length - 1];
        if (lastItem) {
          dispatch({
            type: 'select.var',
            var: lastItem,
          });
          dispatch({
            type: 'set.colorEncoding',
            value: COLOR_ENCODINGS.VAR,
          });
        }
      }, 500),
    [],
  );

  const onVarSelect = useCallback(
    (dispatch, item) => {
      dispatch({
        type: 'add.var',
        var: item,
      });
      pendingVars.current.push(item);
      debouncedSelect(dispatch);
    },
    [debouncedSelect],
  );

  return { onVarSelect, debouncedSelect };
}

function addVarSet(dispatch, { name, vars }) {
  dispatch({
    type: 'add.var',
    var: {
      name: name,
      vars: vars,
      isSet: true,
    },
  });
}

const FEATURE_TYPE = {
  VAR: 'var',
  DISEASE: 'disease',
  OBS: 'obs',
};

export function SearchModal({
  show,
  handleClose,
  text,
  setText,
  displayText,
  handleSelect,
  searchVar,
  searchDiseases,
  searchObs,
}) {
  const getDefaultTab = () => {
    if (searchVar) return FEATURE_TYPE.VAR;
    if (searchDiseases) return FEATURE_TYPE.DISEASE;
    if (searchObs) return FEATURE_TYPE.OBS;
    return null; // fallback
  };
  const [tab, setTab] = useState(getDefaultTab);
  const [selectedResult, setSelectedResult] = useState({
    var: null,
    disease: null,
    obs: null,
  });
  const [varResultsLength, setVarResultsLength] = useState(null);
  const [diseaseResultsLength, setDiseaseResultsLength] = useState(null);
  const [obsResultsLength, setObsResultsLength] = useState(null);

  return (
    <Modal show={show} onHide={handleClose} size="xl" fullscreen="xl-down">
      <Modal.Header className="bg-primary">
        <Container className="gx-0">
          <Row>
            <Col xs={12}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <FormGroup className="cherita-search-modal">
                  <div className="d-flex align-items-center">
                    <InputGroup className="focus-ring focus-ring-warning">
                      <InputGroup.Text>
                        <SearchIcon />
                      </InputGroup.Text>
                      <Form.Control
                        autoFocus
                        type="text"
                        placeholder={'Search ' + displayText}
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          setSelectedResult({
                            var: null,
                            disease: null,
                            obs: null,
                          });
                          setVarResultsLength(null);
                          setDiseaseResultsLength(null);
                          setObsResultsLength(null);
                        }}
                      />
                      <Button variant="light" onClick={handleClose}>
                        <CloseIcon />
                      </Button>
                    </InputGroup>
                  </div>
                </FormGroup>
              </Form>
            </Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body className="p-0 h-100">
        <Container className="h-100">
          <Row className="h-100">
            <Col xs={12} md={8}>
              <Tab.Container activeKey={tab} onSelect={(k) => setTab(k)}>
                <Row className="w-100 h-100">
                  <Col sm={3} className="py-3 border-end">
                    <Nav variant="pills" className="flex-column">
                      {searchVar && (
                        <Nav.Item>
                          <Nav.Link eventKey={FEATURE_TYPE.VAR}>
                            Genes{' '}
                            {!!varResultsLength && `(${varResultsLength})`}
                          </Nav.Link>
                        </Nav.Item>
                      )}
                      {searchDiseases && (
                        <Nav.Item>
                          <Nav.Link eventKey={FEATURE_TYPE.DISEASE}>
                            Diseases{' '}
                            {!!diseaseResultsLength &&
                              `(${diseaseResultsLength})`}
                          </Nav.Link>
                        </Nav.Item>
                      )}
                      {searchObs && (
                        <Nav.Item>
                          <Nav.Link eventKey={FEATURE_TYPE.OBS}>
                            Genes{' '}
                            {!!obsResultsLength && `(${obsResultsLength})`}
                          </Nav.Link>
                        </Nav.Item>
                      )}
                    </Nav>
                  </Col>
                  <Col sm={9} className="py-3">
                    <Tab.Content>
                      {searchVar && (
                        <Tab.Pane eventKey={FEATURE_TYPE.VAR}>
                          <VarSearchResults
                            text={text}
                            handleSelect={handleSelect}
                            selectedResult={selectedResult.var}
                            setSelectedResult={(item) =>
                              setSelectedResult((prev) => {
                                return { ...prev, var: item };
                              })
                            }
                            setResultsLength={setVarResultsLength}
                          />
                        </Tab.Pane>
                      )}
                      {searchDiseases && (
                        <Tab.Pane eventKey={FEATURE_TYPE.DISEASE}>
                          <DiseasesSearchResults
                            text={text}
                            selectedResult={selectedResult.disease}
                            setSelectedResult={(item) =>
                              setSelectedResult((prev) => {
                                return { ...prev, disease: item };
                              })
                            }
                            setResultsLength={setDiseaseResultsLength}
                          />
                        </Tab.Pane>
                      )}
                      {searchObs && (
                        <Tab.Pane eventKey={FEATURE_TYPE.OBS}>
                          <ObsSearchResults
                            text={text}
                            selectedResult={selectedResult.obs}
                            setSelectedResult={(item) =>
                              setSelectedResult((prev) => {
                                return { ...prev, obs: item };
                              })
                            }
                            setResultsLength={setObsResultsLength}
                            handleClose={handleClose}
                          />
                        </Tab.Pane>
                      )}
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Col>
            <Col xs={12} md={4} className="bg-light p-3 search-modal-info">
              {selectedResult[tab] ? (
                (() => {
                  if (tab === FEATURE_TYPE.DISEASE) {
                    return (
                      <DiseaseInfo
                        disease={selectedResult.disease}
                        handleSelect={handleSelect}
                        addVarSet={addVarSet}
                      />
                    );
                  } else if (tab === FEATURE_TYPE.OBS) {
                    return <VarInfo varItem={selectedResult.obs} />;
                  } else {
                    return <VarInfo varItem={selectedResult.var} />;
                  }
                })()
              ) : (
                <div className="text-muted">No result selected</div>
              )}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export function SearchBar({
  searchVar = true,
  searchDiseases = false,
  searchObs = false,
}) {
  const [text, setText] = useState('');
  const displayText = [
    ...(searchVar ? ['features'] : []),
    ...(searchDiseases ? ['diseases'] : []),
  ].join(' and ');

  const [showModal, setShowModal] = useState(false);
  const { onVarSelect, debouncedSelect } = useVarSelect();

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <InputGroup>
            <InputGroup.Text>
              <SearchIcon />
            </InputGroup.Text>
            <Form.Control
              onClick={() => setShowModal(true)}
              type="text"
              placeholder={'Search ' + displayText}
              defaultValue={text}
            />
          </InputGroup>
        </FormGroup>
      </Form>
      <SearchModal
        show={showModal}
        text={text}
        setText={setText}
        displayText={displayText}
        searchVar={searchVar}
        searchDiseases={searchDiseases}
        searchObs={searchObs}
        handleSelect={onVarSelect}
        handleClose={() => {
          debouncedSelect.flush();
          setShowModal(false);
        }}
      />
    </div>
  );
}
