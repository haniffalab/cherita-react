import _ from 'lodash';

import { useSettings } from '../../context/SettingsContext';
import { useObsColsData } from '../../utils/zarrData';

export function ObsExplorer() {
  const settings = useSettings();
  const selectedObsIndex = settings.selectedObsIndex;

  const { data, isPending, serverError } = useObsColsData();

  if (selectedObsIndex == null) {
    return <div className="my-3">No selection</div>;
  }

  if (isPending) {
    return <div className="my-3">Loading...</div>;
  }
  if (serverError) {
    return <div className="my-3">Error loading data</div>;
  }
  return _.map(data, (colData, colName) => (
    <div key={colName} className="mb-4">
      <h5>{colName}</h5>
      {colData}
    </div>
  ));
}
