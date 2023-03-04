export function rotateCounterClockwise(table: string[][]): string[][] {
  const ret: string[][] = table.map(c => c.map(() => "")); // blank copy
  const rows = table.length;
  if (rows === 0) return ret;
  const cols = table[0].length;

  if (!table.every(l => l.length === cols)) throw new Error("Input table is not rectangular");
  const stationaryCell = (rows % 2 !== 0) && (cols % 2 !== 0) ? (Math.min(rows, cols) - 1) / 2 : -1;

  for (let r = 0; r < rows; r++) {
    const nr = rows - 1 - r;
    for (let c = 0; c < cols; c++) {

      const nc = cols - 1 - c;
      const cell = Math.min(r, nr, c, nc);
      let [rNew, cNew] = [r, c];
      if (cell !== stationaryCell) {
        if (nr === cell && nc !== cell) cNew++; // bottom row moves right (except for rightmost)
        else if (c === cell) rNew++; // left column moves down
        else if (r === cell) cNew--; // top row moves left
        else rNew--; // right column moves up
      }
      ret[rNew][cNew] = table[r][c];
    }
  }
  return ret;
}

// please ignore this function!!!
export function rotateClockwise(table: string[][]): string[][] {
  const ret: string[][] = table.map(c => c.map(() => "")); // blank copy
  const rows = table.length;
  if (rows === 0) return ret;
  const cols = table[0].length;
  if (!table.every(l => l.length === cols)) throw new Error("Not rectangular");
  const stationaryCell = (rows % 2 !== 0) && (cols % 2 !== 0) ? (Math.min(rows, cols) - 1) / 2 : -1;
  for (let r = 0; r < rows; r++) {
    const nr = rows - 1 - r;
    for (let c = 0; c < cols; c++) {
      const nc = cols - 1 - c;
      const ring = Math.min(r, nr, c, nc);
      let [rNew, cNew] = [r, c];
      if (ring !== stationaryCell) {
        if (r === ring && nc !== ring) cNew++; // top row moves right (except for rightmost)
        else if (c === ring) rNew--; // left column moves up
        else if (nr === ring) cNew--; // bottom row moves left
        else rNew++; // right column moves down
      }
      ret[rNew][cNew] = table[r][c];
    }
  }
  return ret;
}
