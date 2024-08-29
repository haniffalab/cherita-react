import numbro from "numbro";

export function prettyNumerical(n, precision = 3) {
  if (isNaN(n)) {
    return "NaN";
  } else if (n === 0) {
    return "0";
  } else if (n < 1 / 10 ** precision || n >= 1e6) {
    return numbro(n).format({
      exponential: true,
      mantissa: precision,
      trimMantissa: true,
    });
    // // for abbreviations
    // } else if (n >= 1e6) {
    //   return numbro(n)
    //     .format({
    //       thousandSeparated: true,
    //       spaceSeparated: true,
    //       average: true,
    //       mantissa: precision,
    //       trimMantissa: true,
    //     })
    //     .toUpperCase();
  } else {
    return numbro(n).format({
      thousandSeparated: true,
      mantissa: precision,
      trimMantissa: true,
    });
  }
}
