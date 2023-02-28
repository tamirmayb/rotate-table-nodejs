const fs = require('fs');
const csv = require('fast-csv');
const csvWriter = require('csv-writer');

function processInput(input) {

    const result = [];
    input.forEach(rowWithId => {
        const rowWithIdSplit = rowWithId.split(':');
        const table = [];

        if(rowWithIdSplit.length === 2) {
            const rowId = rowWithIdSplit[0];
            const array = getRowForProcess(rowWithIdSplit[1]);

            const chunkSize = Math.sqrt(array.length);
            if (Number.isInteger(chunkSize)) {
                for (let i = 0; i < array.length; i += chunkSize) {
                    table.push(array.slice(i, i + chunkSize));
                }
                const rotated = rotateCounterClockwise(table);
                result.push({ id: rowId, json: rotated, is_valid: true });

            } else {
                result.push({ id: rowId, json: '[]', is_valid: false });
            }
        } else {
            console.warn('invalid input: ', rowWithId);
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
                array.push(data['id']
                    .concat(':')
                    .concat(data['json']
                    ));
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

function getRowForProcess(row) {
    return row
        .slice(1, -1)
        .replaceAll(' ', '')
        .split(',');
}


runProcess();
