import React, { useState, useEffect } from "react";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Button, ListGroup } from "react-bootstrap";

import { VAR_SORT } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";
import { VarDiseaseInfo } from "../var-list/VarItem";

export function VarInfo({ varItem }) {
  const ENDPOINT = "disease/gene";
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

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
    enabled: !!dataset.diseaseDatasets.length,
  });

  const hasDiseaseInfo = !isPending && !serverError && !!fetchedData?.length;

  return (
    <div>
      <h5>{varItem.name}</h5>
      {!!dataset.diseaseDatasets.length && isPending && <p>Loading...</p>}
      {hasDiseaseInfo && (
        <>
          <h6>Associated diseases</h6>
          <VarDiseaseInfo data={fetchedData} />
        </>
      )}
    </div>
  );
}

const useVarMean = (varKeys, enabled = false) => {
  const ENDPOINT = "matrix/mean";
  const dataset = useDataset();
  const [params, setParams] = useState({
    url: dataset.url,
    varKeys: _.map(varKeys, (v) =>
      v.isSet ? { name: v.name, indices: v.vars.map((v) => v.index) } : v.index
    ),
    // obsIndices:
    varNamesCol: dataset.varNamesCol,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        varKeys: _.map(varKeys, (v) =>
          v.isSet
            ? { name: v.name, indices: v.vars.map((v) => v.index) }
            : v.index
        ),
      };
    });
  }, [varKeys]);

  return useFetch(ENDPOINT, params, {
    enabled: enabled,
    refetchOnMount: false,
  });
};

// ensure nulls are lowest values
const sortMeans = (i, means) => {
  return means[i.name] || _.min(_.values(means)) - 1;
};

export function DiseaseInfo({ disease, handleSelect, addVarSet }) {
  const ENDPOINT = "disease/genes";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
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
    !!diseaseVars?.length && dataset.varSort.disease.sort === VAR_SORT.MATRIX
  );

  useEffect(() => {
    if (dataset.varSort.disease.sort === VAR_SORT.MATRIX) {
      if (!varMeans.isPending && !varMeans.serverError) {
        setSortedDiseaseVars(
          _.orderBy(
            diseaseVars,
            (o) => {
              return sortMeans(o, varMeans.fetchedData);
            },
            dataset.varSort.disease.sortOrder
          )
        );
      }
    } else if (dataset.varSort.disease.sort === VAR_SORT.NAME) {
      setSortedDiseaseVars(
        _.orderBy(diseaseVars, "name", dataset.varSort.disease.sortOrder)
      );
    } else {
      setSortedDiseaseVars(diseaseVars);
    }
  }, [
    dataset.varSort.disease.sort,
    dataset.varSort.disease.sortOrder,
    diseaseVars,
    varMeans.fetchedData,
    varMeans.isPending,
    varMeans.serverError,
  ]);

  const diseaseVarList = _.map(sortedDiseaseVars, (v) => {
    return (
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
                handleSelect(dispatch, v);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>
        </div>
      </ListGroup.Item>
    );
  });

  const isPending =
    diseaseData.isPending ||
    (varMeans.isPending && dataset.varSort.disease.sort === VAR_SORT.MATRIX);

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
