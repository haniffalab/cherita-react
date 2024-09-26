export function prettyNumerical(n, precision = 3) {
  if (n === 0) {
    return "0";
  } else if (n < 1 / 10 ** precision) {
    return n.toExponential(precision);
  } else {
    return n.toLocaleString(undefined, { maximumFractionDigits: precision });
  }
}
