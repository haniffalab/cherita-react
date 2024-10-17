import numbro from "numbro";

export const FORMATS = {
  EXPONENTIAL: "exponential",
  ABBREVIATION: "abbreviation",
  THOUSAND: "thousand",
};

function formatThousand(n, precision = 3) {
  return numbro(n).format({
    thousandSeparated: true,
    mantissa: precision,
    trimMantissa: true,
  });
}

function formatExponential(n, precision = 3) {
  return numbro(n).format({
    exponential: true,
    mantissa: precision,
    trimMantissa: true,
  });
}

function formatAbbreviation(n, precision = 3) {
  return numbro(n)
    .format({
      average: true,
      mantissa: precision,
      trimMantissa: true,
    })
    .toUpperCase();
}

export function formatNumerical(n, format = FORMATS.THOUSAND, precision = 3) {
  if (isNaN(n)) {
    return "NaN";
  } else if (n === 0) {
    return "0";
  }

  switch (format) {
    case FORMATS.EXPONENTIAL:
      if (n < 1 / 10 ** precision || n >= 1e6) {
        return formatExponential(n, precision);
      } else {
        return formatThousand(n, precision);
      }
    case FORMATS.ABBREVIATION:
      if (n >= 1e6) {
        return formatAbbreviation(n, precision);
      } else {
        return formatThousand(n, precision);
      }
    case FORMATS.THOUSAND:
    default:
      return formatThousand(n, precision);
  }
}
