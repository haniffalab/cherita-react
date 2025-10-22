import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import { DEFAULT_OBSM_KEYS } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { useFetch } from '../../utils/requests';
import { ObsmKeysListBtn } from '../../utils/Skeleton';

export function ObsmKeysList() {
  const ENDPOINT = 'obsm/keys';
  const dataset = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [obsmKeysList, setObsmKeysList] = useState([]);
  const [active, setActive] = useState(null);
  const [params, setParams] = useState({
    url: dataset.url,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
  }, [dataset.url]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && !serverError && fetchedData) {
      setObsmKeysList(fetchedData);

      // Set default obsm if in keys list and not selected
      if (!settings.selectedObsm && !!fetchedData.length) {
        // Follow DEFAULT_OBSM_KEYS order
        _.each(DEFAULT_OBSM_KEYS, (k) => {
          const defaultObsm = _.find(
            fetchedData,
            (item) => item.toLowerCase() === k,
          );
          if (defaultObsm) {
            dispatch({
              type: 'select.obsm',
              obsm: defaultObsm,
            });
            return false; // break
          }
        });
      }

      if (settings.selectedObsm) {
        // If selected obsm is not in keys list, reset to null
        if (!_.includes(fetchedData, settings.selectedObsm)) {
          dispatch({
            type: 'select.obsm',
            obsm: null,
          });
        } else {
          setActive(settings.selectedObsm);
        }
      }
    }
  }, [dispatch, fetchedData, isPending, serverError, settings.selectedObsm]);

  const obsmList = obsmKeysList.map((item) => {
    return (
      <Dropdown.Item
        key={item}
        className={`custom ${active === item && 'active'}`}
        onClick={() => {
          dispatch({
            type: 'select.obsm',
            obsm: item,
          });
        }}
      >
        {item}
      </Dropdown.Item>
    );
  });

  if (!serverError) {
    if (isPending) {
      return <ObsmKeysListBtn />;
    }

    return (
      <DropdownButton
        as={ButtonGroup}
        title={settings.selectedObsm || 'Select an embedding'}
        variant={settings.selectedObsm ? 'primary' : 'warning'}
        id="bg-nested-dropdown"
        size="sm"
      >
        <Dropdown.Header>Embeddings</Dropdown.Header>
        {obsmList}
      </DropdownButton>
    );
  } else {
    return (
      <OverlayTrigger
        placement="top"
        delay={{ show: 100, hide: 200 }}
        overlay={<Tooltip>{serverError.message}</Tooltip>}
      >
        <Button variant="danger">Error</Button>
      </OverlayTrigger>
    );
  }
}
