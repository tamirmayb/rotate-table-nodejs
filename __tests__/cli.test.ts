import { Input, Output, processInput } from '../src/cli.js';
describe('processInput functionality tests', () => {

  it('happy flow 1-9', () => {
    const input: Input[] = [];
    const expected: Output[] = [{
      id: '1',
      json: ['2', '3', '6', '1', '5', '9', '4', '7', '8'],
      is_valid: true
    }];
    input.push({id:'1', json: '"[1, 2, 3, 4, 5, 6, 7, 8, 9]"'});
    const result: Output[] = processInput(input);
    expect(result).not.toBeNull();
    expect(result.length).toEqual(1);
    expect(result[0].json.length).toEqual(9);
    expect(result[0].is_valid).toEqual(true);
    expect(result).toEqual(expected);
  });

  it('should be invalid - not rectangular', () => {
    const input: Input[] = [];
    input.push({id:'1', json: '"[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"'});
    const result: Output[] = processInput(input);
    expect(result).not.toBeNull();
    expect(result.length).toEqual(1);
    expect(result[0].json.length).toEqual(1);
    expect(result[0].is_valid).toEqual(false);
  });

  it('2 valid inputs', () => {
    const input: Input[] = [];
    input.push({id:'1', json: '"[1, 2, 3, 4]"'});
    input.push({id:'1', json: '"[5]"'});
    const result: Output[] = processInput(input);
    expect(result).not.toBeNull();
    expect(result.length).toEqual(2);
    expect(result[0].json.length).toEqual(4);
    expect(result[0].is_valid).toEqual(true);
    expect(result[1].json.length).toEqual(1);
    expect(result[1].is_valid).toEqual(true);
  });



});
