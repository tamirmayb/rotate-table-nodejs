# Typescript read CSV file and rotate table.

### Author: Tamir Mayblat (tamirmayb@gmail.com)

### Details:
#### Given a CSV file representing a series of tables, implement a rotation engine that parses, verifies and rotates each table, and finally outputs a CSV file with all valid and rotated tables.
#### You work with a list of numbers that represent a table your program has to interpret correctly. Since there is nothing but a flat list, the program has to infer the rows and columns from this data, if needed.
##### If the square edge length is odd and there is a singular field in the middle of the table, it is not moved.
##### The task is to rotate the table to the left.

### How to run this project?

#### 1. Install dependencies

```bash
$ npm install
```

#### 2. Build the project, make sure that a ```dist``` folder containing /src/cli.js are added.  

```bash
$ npm install
```

#### 3. Run in development mode - this will run the process with the default input.csv file. 

```bash
$ npm start run
```

#### You can use your own csv file by adding it to the root directory of the project and run
```bash
node dist/src/cli.js your_file.csv
```

#### 3. Tests - The project uses jest for tests. There are 3 tests located in cli.test.ts/js, you can run them with
```bash
$ npm test
```

------
#### Please let me know if you have any questions or issues.
#### Thank you!