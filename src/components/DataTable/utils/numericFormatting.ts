import { ColDef, ValueFormatterParams } from "ag-grid-community";

/**
 * Converts a decimal price to MBS tick format (points-32nds notation)
 */
export function decimalToTickFormat(decimalPrice: number | null | undefined): string {
  if (decimalPrice == null || isNaN(decimalPrice)) return "";
  const wholePoints = Math.floor(decimalPrice);
  const fraction = decimalPrice - wholePoints;
  const thirtySeconds = fraction * 32;
  const wholeThirtySeconds = Math.floor(thirtySeconds);
  const remainderIn256ths = Math.round((thirtySeconds - wholeThirtySeconds) * 8);

  if (remainderIn256ths > 0) {
    return `${wholePoints}-${wholeThirtySeconds}${remainderIn256ths}`;
  } else {
    return `${wholePoints}-${wholeThirtySeconds < 10 ? '0' + wholeThirtySeconds : wholeThirtySeconds}`;
  }
}

/**
 * Formats large numbers with K, M, B suffixes.
 */
export function formatNumberKMB(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return "";
  if (Math.abs(num) < 1000) {
    return num.toString(); // No suffix needed
  }
  const si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "K" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
    { value: 1E12, symbol: "T" } // Add Trillion if needed
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(num) >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(1).replace(rx, "$1") + si[i].symbol;
}

/**
 * Applies numeric formatting options to a list of column definitions.
 */
export const applyNumericFormattingToDefs = (defs: ColDef[], formatOption: string): ColDef[] => {
  if (!defs) return [];

  // Refined keyword list (removed 'id')
  const numericKeywords = [
    'price', 'amount', 'quantity', 'value', 'number',
    'count', 'size', 'total', 'balance', 'rate', 'level',
    'vol', 'pct', 'percent', 'chg', 'age', 'qty', 'cost'
  ];

  return defs.map((colDef: ColDef) => {
    const fieldName = (colDef.field || colDef.colId || '').toLowerCase();
    const type = colDef.type;
    const isExplicitlyNumeric = Array.isArray(type) ? type.includes('numericColumn') : type === 'numericColumn';
    // Check if type is defined AND is NOT numeric
    const isExplicitlyNonNumeric = type !== undefined && !isExplicitlyNumeric;
    // Only use keywords if type is completely undefined
    const checkKeywords = type === undefined && numericKeywords.some(keyword => fieldName.includes(keyword));

    // Determine if we should apply numeric formatting
    const applyNumericFormat =
        isExplicitlyNumeric || // Definitely numeric
        checkKeywords;          // Type is undefined, but keywords match

    // Only apply formatting if needed AND not explicitly non-numeric
    if (applyNumericFormat && !isExplicitlyNonNumeric) {
      let newValueFormatter: ((params: ValueFormatterParams) => string) | undefined = undefined;

      switch (formatOption) {
        case 'currency':
          newValueFormatter = (params: ValueFormatterParams) => {
            if (params.value == null || isNaN(params.value)) return '';
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value);
          };
          break;
        case 'dec0':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(0);
          break;
        case 'dec1':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(1);
          break;
        case 'dec2':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(2);
          break;
        case 'dec3':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(3);
          break;
        case 'dec4':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(4);
          break;
        case 'kmb': // Note: Was 'k', 'm', 'b' before, consolidated
          newValueFormatter = (params: ValueFormatterParams) => formatNumberKMB(params.value);
          break;
        case 'tick':
          newValueFormatter = (params: ValueFormatterParams) => decimalToTickFormat(params.value);
          break;
        case 'default':
        default:
          newValueFormatter = undefined;
          break;
      }

      return {
          ...colDef,
          cellStyle: colDef.cellStyle,
          valueFormatter: newValueFormatter
      };
    }

    // Return original definition if no formatting applied
    return colDef;
  });
};
