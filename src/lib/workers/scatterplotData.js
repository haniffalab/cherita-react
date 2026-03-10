/* eslint-disable no-restricted-globals */

let cachedPositions = new Float32Array(0);
let cachedValues = new Float32Array(0);
let cachedIndexEnabledBitmask = new Uint8Array(0);
let cachedObsIndices = null;
let cachedCount = 0;

function computeBitmask(indices) {
  if (indices === null) return new Uint8Array(cachedCount).fill(1);
  const bitmask = new Uint8Array(cachedCount);
  for (const idx of indices) {
    bitmask[idx] = 1;
  }
  return bitmask;
}

self.onmessage = ({ data }) => {
  if (data.positions) {
    cachedPositions = new Float32Array(data.positions.flat());
    cachedCount = data.positions.length;
  }

  if (data.values) {
    cachedValues = new Float32Array(data.values);
  }

  if (data.obsIndices !== undefined) {
    cachedObsIndices = data.obsIndices;
  }

  if (data.positions || data.obsIndices !== undefined) {
    cachedIndexEnabledBitmask = computeBitmask(cachedObsIndices);
  }

  // Copy for transfer so cached buffers stay valid
  const positions = new Float32Array(cachedPositions);
  const values = new Float32Array(cachedValues);
  const indexEnabledBitmask = new Uint8Array(cachedIndexEnabledBitmask);

  self.postMessage(
    { count: cachedCount, positions, values, indexEnabledBitmask },
    [positions.buffer, values.buffer, indexEnabledBitmask.buffer],
  );
};
