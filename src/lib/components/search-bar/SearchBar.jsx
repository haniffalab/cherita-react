import { useState } from 'react';

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
import { DiseasesSearchResults, VarSearchResults } from './SearchResults';
import { COLOR_ENCODINGS } from '../../constants/constants';

const select = (dispatch, item) => {
  dispatch({
    type: 'select.var',
    var: item,
  });
  dispatch({
    type: 'select.multivar',
    var: item,
  });
  dispatch({
    type: 'set.colorEncoding',
    value: COLOR_ENCODINGS.VAR,
  });
};

const debounceSelect = _.debounce(select, 500);

function onVarSelect(dispatch, item) {
  dispatch({
    type: 'add.var',
    var: item,
  });
  debounceSelect(dispatch, item);
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
};

export function SearchModal({
  show,
  handleClose,
  text,
  setText,
  displayText,
  handleSelect = onVarSelect,
  searchVar,
  searchDiseases,
}) {
  const [tab, setTab] = useState('var');
  const [selectedResult, setSelectedResult] = useState({
    var: null,
    disease: null,
  });
  const [varResultsLength, setVarResultsLength] = useState(null);
  const [diseaseResultsLength, setDiseaseResultsLength] = useState(null);

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header className="bg-primary">
        <Container className="gx-0">
          <Row>
            <Col xs={12}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <FormGroup>
                  <div className="d-flex align-items-center">
                    <InputGroup>
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
                          });
                          setVarResultsLength(null);
                          setDiseaseResultsLength(null);
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
      <Modal.Body className="p-0">
        <Container>
          <Row>
            <Col xs={12} md={8}>
              <Tab.Container activeKey={tab} onSelect={(k) => setTab(k)}>
                <Row className="w-100">
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
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Col>
            <Col xs={12} md={4} className="bg-light p-3 search-modal-info">
              {selectedResult[tab] ? (
                tab === FEATURE_TYPE.DISEASE ? (
                  <DiseaseInfo
                    disease={selectedResult.disease}
                    handleSelect={handleSelect}
                    addVarSet={addVarSet}
                  />
                ) : (
                  <VarInfo varItem={selectedResult.var} />
                )
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

export function SearchBar({ searchVar = true, searchDiseases = false }) {
  const [text, setText] = useState('');
  const displayText = [
    ...(searchVar ? ['features'] : []),
    ...(searchDiseases ? ['diseases'] : []),
  ].join(' and ');

  const [showModal, setShowModal] = useState(false);

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
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
}
