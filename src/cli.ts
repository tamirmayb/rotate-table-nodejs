import { createReadStream } from "fs";
import { parse } from "fast-csv";
import { format } from "@fast-csv/format";

export interface Input {
  id: string
  json: string
}

export interface Output {
  id: string
  json: string[]
  is_valid: boolean
}

async function runProcess (): Promise<void> {
  const fileName = process.argv.slice(2)[0];

  const input = await readCSV(fileName);
  const results = processInput(input);

  const csvStream = format({ headers: true });
  csvStream.pipe(process.stdout).on('end', () => process.exit());
  results.forEach(result=> {
    csvStream.write({ id: result.id, json: result.json, is_valid: result.is_valid });
  });
  csvStream.end();
}

async function readCSV (fileName: string): Promise<Input[]> {
  const array: Input[] = [];

  return new Promise((resolve, reject) => {
    createReadStream(fileName)
      .pipe(parse({
        headers: ['id', 'json'],
        skipRows:1
      }))
      .on('error', (error: Error) => reject(error))
      .on('data', function (data: { [x: string]: string; }) {
        array.push({
          id: data['id'],
          json: data['json']
        })
      })
      .on('end', () => {
        resolve(array);
      });
  })
}

export function processInput (input: Input[]): Output[] {
  const result: Output[] = [];

  input.forEach(row => {
    const table = [];
    const rowId = row.id;
    const array = convertRowToArray(row.json);

    // split array into same size chunks, if chunk is not same size it's not valid
    const chunkSize = Math.sqrt(array.length);
    if (Number.isInteger(chunkSize)) {
      for (let i = 0; i < array.length; i += chunkSize) {
        table.push(array.slice(i, i + chunkSize));
      }

      // rotate input and push results to output
      const rotated = rotateCounterClockwise(table);
      const flatten = flattenTable(rotated);
      result.push({ id: rowId, json: flatten, is_valid: true });
    } else {
      result.push({ id: rowId, json: ['[]'], is_valid: false });
    }
  })
  return result;
}

function flattenTable(table: string[][]): string[] {
  const result: string[] = [];
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      result.push(table[i][j].replaceAll(' ', ''));
    }
  }
  return result;
}

function convertRowToArray (row: string): string[] {
  return row
    .slice(1, -1)
    .replace(' ', '')
    .replace('[', '')
    .replace(']', '')
    .split(',')
}

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

runProcess();

// 1 2 3  ==>   2 3 6
// 4 5 6        1 5 9
// 7 8 9        4 7 8
