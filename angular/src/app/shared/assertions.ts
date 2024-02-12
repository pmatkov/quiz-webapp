export function assert<T>(value: T | null | undefined): T {

    if (value === null) {
        throw new Error('Assertion failed: value is null.');
      }
    else if (value === undefined) {
        throw new Error('Assertion failed: value is undefined.');
    }
    else {
        return value as T;
    }
}
  
export function assertNumber(value: unknown): asserts value is number {
    assert(typeof value === 'number');
}