import { useState, useEffect } from 'react';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';
import { Button, ListGroup } from 'react-bootstrap';

import { VAR_SORT } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { useFetch } from '../../utils/requests';
import { useNCBIData } from '../../utils/useNCBIData';
import { VarDiseaseInfo } from '../var-list/VarItem';
import { sortMeans, useVarMean } from '../var-list/VarList';

export function VarInfo({ varItem }) {
  const ENDPOINT = 'disease/gene';
  const dataset = useDataset();
  const [params, setParams] = useState({
    geneName: varItem.name,
    diseaseDatasets: dataset.diseaseDatasets,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        geneName: varItem.name,
      };
    });
  }, [varItem.name]);

  const {
    fetchedData: ncbiData,
    isPending: isNCBIPending,
    serverError: ncbiError,
  } = useNCBIData({ symbol: varItem.name });

  const geneDescription =
    ncbiData?.reports?.[0]?.gene?.summary?.[0]?.description;

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
    enabled: !!dataset.diseaseDatasets.length,
  });

  const hasDiseaseInfo = !isPending && !serverError && !!fetchedData?.length;

  return (
    <div>
      <h2>{varItem.name}</h2>
      {isNCBIPending && (
        <p className="text-muted small">Loading gene description…</p>
      )}
      {!isNCBIPending && !ncbiError && geneDescription && (
        <>
          <p className="small">{geneDescription}</p>
          <p className="text-muted small">
            Data fetched from{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/datasets/docs/v2/api/rest-api/"
              target="_blank"
              rel="noreferrer"
            >
              NCBI API
            </a>
            {' · '}
            <a
              href={`https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(varItem.name)}`}
              target="_blank"
              rel="noreferrer"
            >
              Gene page
            </a>
          </p>
        </>
      )}
      {!!dataset.diseaseDatasets.length && isPending && <p>Loading...</p>}
      {hasDiseaseInfo && (
        <>
          <h5 className="fw-bold mb-2">
            <Tooltip
              title={
                <>
                  Reported and inferred diseases associated with this gene,
                  including supporting metadata.
                </>
              }
              placement="left"
              arrow
            >
              Associated Diseases
            </Tooltip>
          </h5>
          <VarDiseaseInfo data={fetchedData} />
        </>
      )}
    </div>
  );
}

export function DiseaseInfo({ disease, handleSelect, addVarSet }) {
  const ENDPOINT = 'disease/genes';
  const dataset = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [diseaseVars, setDiseaseVars] = useState([]);
  const [sortedDiseaseVars, setSortedDiseaseVars] = useState([]);
  const [params, setParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    diseaseDatasets: dataset.diseaseDatasets,
    diseaseId: disease.id,
  });

  useEffect(() => {
    setParams((p) => {
      return { ...p, diseaseId: disease.id };
    });
  }, [disease]);

  const diseaseData = useFetch(ENDPOINT, params, {
    enabled: !!params.diseaseId,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!diseaseData.isPending && !diseaseData.serverError) {
      setDiseaseVars(diseaseData.fetchedData);
    }
  }, [diseaseData.fetchedData, diseaseData.isPending, diseaseData.serverError]);

  const varMeans = useVarMean(
    diseaseVars,
    !!diseaseVars?.length && settings.varSort.disease.sort === VAR_SORT.MATRIX,
  );

  useEffect(() => {
    if (settings.varSort.disease.sort === VAR_SORT.MATRIX) {
      if (!varMeans.isPending && !varMeans.serverError) {
        setSortedDiseaseVars(
          _.orderBy(
            diseaseVars,
            (o) => {
              return sortMeans(o, varMeans.fetchedData);
            },
            settings.varSort.disease.sortOrder,
          ),
        );
      }
    } else if (settings.varSort.disease.sort === VAR_SORT.NAME) {
      setSortedDiseaseVars(
        _.orderBy(diseaseVars, 'name', settings.varSort.disease.sortOrder),
      );
    } else {
      setSortedDiseaseVars(diseaseVars);
    }
  }, [
    settings.varSort.disease.sort,
    settings.varSort.disease.sortOrder,
    diseaseVars,
    varMeans.fetchedData,
    varMeans.isPending,
    varMeans.serverError,
  ]);

  const diseaseVarList = _.map(sortedDiseaseVars, (v) => {
    return (
      <div className="virtualized-list-wrapper">
        <ListGroup.Item key={v.gene_id}>
          <div className="d-flex justify-content-between align-items-center w-100">
            {v.name}
            <div className="d-flex align-items-center gap-1">
              <Button
                type="button"
                className="m-0 p-0 px-1"
                variant="outline-secondary"
                title="Add to list"
                onClick={() => {
                  handleSelect(dispatch, {
                    name: v.name,
                    index: v.index,
                    matrix_index: v.matrix_index,
                  });
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
          </div>
        </ListGroup.Item>
      </div>
    );
  });

  const isPending =
    diseaseData.isPending ||
    (varMeans.isPending && settings.varSort.disease.sort === VAR_SORT.MATRIX);

  return (
    <div>
      <h5>{disease.disease_name}</h5>
      <h6>Implicated genes</h6>
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="d-flex justify-content-end mb-2">
            <Button
              size="sm"
              title="Add all as a set"
              onClick={() => {
                addVarSet(dispatch, {
                  name: disease.disease_name,
                  vars: _.map(diseaseVars, (v) => {
                    return {
                      index: v.index,
                      name: v.name,
                      matrix_index: v.matrix_index,
                    };
                  }),
                });
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add all as a set
            </Button>
          </div>
          <ListGroup className="overflow-scroll">{diseaseVarList}</ListGroup>
        </>
      )}
    </div>
  );
}
