export const parseError = (err) => {
  if (err === DOMException.TIMEOUT_ERR) {
    return { message: "Timeout error", name: err };
  }
  switch (err?.name) {
    case "TypeError":
      return { ...err, message: "Failed to fetch data from server" };
    case "ReadZarrError":
      return { ...err, message: "Failed to read AnnData-Zarr" };
    case "InvalidObs":
      return { ...err, message: "Observation not found in dataset" };
    case "InvalidVar":
      return { ...err, message: "Feature not found in dataset" };
    case "InvalidKey":
      return { ...err, message: "Key not found in datset" };
    default:
      return err;
  }
};
