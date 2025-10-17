import { useSettings } from "../../context/SettingsContext";
import { useZarrData } from "../../context/ZarrDataContext";
import { useLabelObsData } from "../../utils/zarrData";

export function ObsExplorer() {
  const settings = useSettings();
  const { obsData } = useZarrData();
  const labelObsData = useLabelObsData();
  const selectedObsIndex = settings.selectedObsIndex;

  if (!selectedObsIndex) {
    return <div>No observation selected</div>;
  }

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between mb-2">
        Selected index: {selectedObsIndex}
      </div>
    </div>
  );
}
