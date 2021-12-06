import {
  directionIsInBounds,
  getAdjacentPlayingSquareIndex
} from './utilities';

interface Test<Target extends (...args: any[]) => unknown> {
  arguments: Parameters<Target>,
  expected: ReturnType<Target>
}

describe('directionIsInBounds', () => {
  const tests: Test<typeof directionIsInBounds>[] = [
    {
      arguments: [ 0, 'nw' ],
      expected: false
    },
    {
      arguments: [ 3, 'sw' ],
      expected: true
    },
    {
      arguments: [ 3, 'ne' ],
      expected: false
    },
    {
      arguments: [ 19, 'sw' ],
      expected: true
    },
    {
      arguments: [ 19, 'ne' ],
      expected: false
    },
    {
      arguments: [ 24, 'se' ],
      expected: true
    },
    {
      arguments: [ 27, 'nw' ],
      expected: true
    },
    {
      arguments: [ 31, 'sw' ],
      expected: false
    }
  ];

  tests.forEach(test =>
    it(`should return ${ test.expected } for ${ test.arguments.join(', ') }`, () =>
      expect(directionIsInBounds(...test.arguments)).toEqual(test.expected)
    )
  );
});

describe('getAdjacentPlayingSquareIndex', () => {
  const tests: Test<typeof getAdjacentPlayingSquareIndex>[] = [
    {
      arguments: [ 0, 'nw' ],
      expected: null
    },
    {
      arguments: [ 19, 'sw' ],
      expected: 23
    },
    {
      arguments: [ 19, 'nw' ],
      expected: 15
    },
    {
      arguments: [ 19, 'ne' ],
      expected: null
    }
  ];

  tests.forEach(test =>
    it(`should return ${ test.expected } for ${ test.arguments.join(', ') }`, () =>
      expect(getAdjacentPlayingSquareIndex(...test.arguments)).toEqual(test.expected)
    )
  );
});
