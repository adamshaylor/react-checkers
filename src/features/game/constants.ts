import {
  Color,
  Direction,
  Piece,
  Rank
} from './types';

export const playingSquaresPerRow = 4;
export const numberOfRows = playingSquaresPerRow * 2;
export const playingSquaresCount = playingSquaresPerRow * numberOfRows;
export const maxPlayingSquareIndex = playingSquaresCount - 1;

export const red: Color = 'red';
export const white: Color = 'white';
export const man: Rank = 'man';

export const rm: Piece = { color: red, rank: man };
export const wm: Piece = { color: white, rank: man };

export const nw: Direction = 'nw';
export const ne: Direction = 'ne';
export const se: Direction = 'se';
export const sw: Direction = 'sw';
export const directions = [ nw, ne, se, sw ];

// Parity is zero-indexed (even rows are 0th, 2nd, 4th, etc.)
// NOTE: These offsets assume directional bounds have been checked.

export const evenRowPlayingSquareOffsets: Record<Direction, number> = {
  nw: -4,
  ne: -3,
  se: 5,
  sw: 4
};

export const oddRowPlayingSquareOffsets: Record<Direction, number> = {
  nw: -5,
  ne: -4,
  se: 4,
  sw: 3
};
