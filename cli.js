const fs = require('fs');
const csv = require('fast-csv');
const csvWriter = require('csv-writer');

function processInput(input) {
    const result = [];

    input.forEach(row => {
        const table = [];
        const rowId = row.rowId;
        const array = convertRowToArray(row.json);

        // split array into same size chunks, if chunk is not same size it's not valid
        const chunkSize = Math.sqrt(array.length);
        if (Number.isInteger(chunkSize)) {
            for (let i = 0; i < array.length; i += chunkSize) {
                table.push(array.slice(i, i + chunkSize));
            }

            // rotate input and push results to output
            const rotated = rotateCounterClockwise(table);
            result.push({ id: rowId, json: rotated, is_valid: true });

        } else {
            result.push({ id: rowId, json: '[]', is_valid: false });
        }
    });
    return result;
}

function runProcess() {
    const fileName = process.argv.slice(2)[0];

    (async() => {
        const input = await readCSV(fileName);
        const results = processInput(input);
        writeToCSV(results);
    })();
}

async function readCSV(fileName) {
    let array = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(fileName)
            .pipe(csv.parse({
                headers: ['id', 'json'],
                skipRows:1
            }))
            .on('error', error => reject(error))
            .on('data', function (data) {
                array.push({
                    rowId: data['id'],
                    json: data['json']
                })
            })
            .on('end', () => {
                resolve(array);
            });
    });
}

function writeToCSV(table) {
    csvWriter.createObjectCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'id', title: 'id' },
            { id: 'json', title: 'json' },
            { id: 'is_valid', title: 'is_valid' }
        ]
    })
        .writeRecords(table)
        .then(()=> console.log('Results added to CSV file'));

}

function rotateCounterClockwise(table) {
    const rowCount = table.length;
    const colCount = table[0].length;

    const rotatedTable = [];
    for (let i = 0; i < colCount; i++) {
        rotatedTable.push([]);
    }

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            // rotatedTable[col][rowCount - 1 - row] = table[row][col]; // clockwise
            rotatedTable[rowCount - col - 1][row] = table[row][col]; // counterclockwise
        }
    }
    return rotatedTable;
}

function convertRowToArray(row) {
    return row
        .slice(1, -1)
        .replaceAll(' ', '')
        .split(',');
}


runProcess();
