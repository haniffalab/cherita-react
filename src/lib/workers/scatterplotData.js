const WORKER_CODE = `
function computeBitmask(indices, length) {
  if (indices === null) return new Uint8Array(length).fill(1);
  const bitmask = new Uint8Array(length);
  for (const idx of indices) {
    bitmask[idx] = 1;
  }
  return bitmask;
}

self.onmessage = ({ data }) => {
  // compute and transfer only updated data
  const msg = {};
  const transfer = [];

  if (data.positions) {
    const positions = new Float32Array(data.positions.flat());
    msg.positions = positions;
    msg.count = data.positions.length;
    transfer.push(positions.buffer);
  }

  if (data.values) {
    const values = new Float32Array(data.values);
    msg.values = values;
    transfer.push(values.buffer);
  }

  if (data.obsIndices !== undefined && !!data.length) {
    const bitmask = computeBitmask(data.obsIndices, data.length);
    msg.indexEnabledBitmask = bitmask;
    transfer.push(bitmask.buffer);
  }

  self.postMessage(msg, transfer);
};
`;

export function createScatterplotWorker() {
  const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}
