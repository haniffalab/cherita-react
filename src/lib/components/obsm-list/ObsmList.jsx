import { useEffect, useState, useMemo } from 'react';

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

export function ObsmKeysList({ setHasObsm }) {
  const ENDPOINT = 'obsm/keys';
  const dataset = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [keysList, setKeysList] = useState([]);

  const params = useMemo(
    () => ({
      url: dataset.url,
    }),
    [dataset.url],
  );

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && fetchedData && !serverError) {
      if (!fetchedData.length) {
        setHasObsm(false);
        if (settings.selectedObsm) {
          dispatch({
            type: 'select.obsm',
            obsm: null,
          });
        }
      } else {
        setHasObsm(true);
        setKeysList(fetchedData);

        if (settings.selectedObsm) {
          // If selected obsm is not in keys list, reset to null
          if (!_.includes(fetchedData, settings.selectedObsm)) {
            dispatch({
              type: 'select.obsm',
              obsm: null,
            });
          }
        } else {
          // Set default obsm if in keys list and not selected
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
      }
    }
  }, [
    dispatch,
    fetchedData,
    isPending,
    serverError,
    setHasObsm,
    settings.selectedObsm,
  ]);

  const obsmList = _.map(keysList, (item) => {
    return (
      <Dropdown.Item
        key={item}
        className={`custom ${settings.selectedObsm === item && 'active'}`}
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
