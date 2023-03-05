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
  const result: string[][] = table.map(c => c.map(() => "")); // create same size empty result table
  const rows = table.length;
  if (rows === 0) return result;
  const cols = table[0].length;

  // check table is a rectangular (just in case this function is used as standalone)
  if (!table.every(l => l.length === cols)) throw new Error("Input table is not rectangular");
  const stationaryCell = (rows % 2 !== 0) && (cols % 2 !== 0) ? (Math.min(rows, cols) - 1) / 2 : -1;

  for (let currRow = 0; currRow < rows; currRow++) {
    const mirrorRow = rows - 1 - currRow;
    for (let currCol = 0; currCol < cols; currCol++) {

      const mirrorCol = cols - 1 - currCol;
      const cell = Math.min(currRow, mirrorRow, currCol, mirrorCol);

      let [newRow, newCol] = [currRow, currCol];
      if (cell !== stationaryCell) {
        if (mirrorRow === cell && mirrorCol !== cell) newCol++; // bottom row moves right (except for rightmost)
        else if (currCol === cell) newRow++; // left column moves down
        else if (currRow === cell) newCol--; // top row moves left
        else newRow--; // right column moves up
      }
      result[newRow][newCol] = table[currRow][currCol];
    }
  }
  return result;
}

runProcess();

// 1 2 3  ==>   2 3 6
// 4 5 6        1 5 9
// 7 8 9        4 7 8




