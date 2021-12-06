import {
  Color,
  Direction,
  GameState,
  JumpMoveActionType,
  MaybeMove,
  Move,
  MoveTypeAndDirection,
  PhysicalLocation,
  PlayerAction,
  PlayerActionType,
  PlayingSquaresState,
  SimpleMoveActionType
} from './types';

import {
  directions,
  evenRowPlayingSquareOffsets,
  man,
  maxPlayingSquareIndex,
  ne,
  numberOfRows,
  nw,
  oddRowPlayingSquareOffsets,
  playingSquaresPerRow,
  red,
  se,
  sw
} from './constants';

// Parity is zero-indexed (even rows are 0th, 2nd, 4th, etc.)
export const playingSquareIndexIsInEvenRow = (index: number): boolean => {
  const rowIndex = Math.floor(index / playingSquaresPerRow);
  return rowIndex % 2 === 0;
}

export const directionIsInBounds = (originIndex: number, direction: Direction): boolean => {
  const isNorth = direction === 'nw' || direction === 'ne';
  if (
    isNorth &&
    originIndex < playingSquaresPerRow
  ) {
    return false;
  }

  const isSouth = direction === 'sw' || direction === 'se';
  if (
    isSouth &&
    originIndex >= playingSquaresPerRow * (numberOfRows - 1)
  ) {
    return false;
  }

  const isInEvenRow = playingSquareIndexIsInEvenRow(originIndex);

  const isWest = direction === 'nw' || direction === 'sw';
  if (
    isWest &&
    !isInEvenRow &&
    originIndex % playingSquaresPerRow === 0
  ) {
    return false;
  }

  const isEast = direction === 'ne' || direction === 'se';
  if (
    isEast &&
    isInEvenRow &&
    (originIndex + 1) % playingSquaresPerRow === 0
  ) {
    return false;
  }

  return true;
};

export const playingSquareIndexIsInBounds = (index: number): boolean =>
  0 <= index &&
  index <= maxPlayingSquareIndex;

export const getAdjacentPlayingSquareIndex = (originIndex: number, direction: Direction): number | null => {
  if (!directionIsInBounds(originIndex, direction)) {
    return null;
  }
  return playingSquareIndexIsInEvenRow(originIndex)
    ? originIndex + evenRowPlayingSquareOffsets[direction]
    : originIndex + oddRowPlayingSquareOffsets[direction];
};

export const getJumpPlayingSquareIndex = (originIndex: number, direction: Direction): number | null => {
  const adjacentIndex = getAdjacentPlayingSquareIndex(originIndex, direction);
  return adjacentIndex === null
    ? null
    : getAdjacentPlayingSquareIndex(adjacentIndex, direction);
};

export const getLastPlayerAction = (gameState: GameState): PlayerAction<PlayerActionType> | null =>
  gameState.playerActions.slice(-1)[0] || null;

export const getCurrentPlayingSquaresState = (gameState: GameState): PlayingSquaresState => {
  const lastPlayerAction = getLastPlayerAction(gameState);
  return lastPlayerAction
    ? lastPlayerAction.resultantPlayingSquaresState
    : gameState.initialPlayingSquaresState;
};

export const getPiecePlayingSquareIndicesForColor = (playingSquaresState: PlayingSquaresState, color: Color): number[] =>
  playingSquaresState.reduce(
    (indices, playingSquare, playingSquareIndex) =>
      playingSquare &&
      playingSquare.color === color
        ? indices.concat(playingSquareIndex)
        : indices,
    [] as number[]
  )

export const isJustAMove = (move: MaybeMove): move is Move =>
  typeof move.to === 'number';

export const getMaybeSimpleMove = (originIndex: number, direction: Direction): MaybeMove => ({
  from: originIndex,
  to: getAdjacentPlayingSquareIndex(originIndex, direction)
});

export const getPotentialSimpleMoves = (originIndex: number): Move[] =>
  directions
    .map(direction => getMaybeSimpleMove(originIndex, direction))
    .filter(isJustAMove);

export const getAllLegalSimpleMoves = (playingSquaresState: PlayingSquaresState, color: Color): Move[] => {
  const pieceIndicesForColor = getPiecePlayingSquareIndicesForColor(playingSquaresState, color);
  const potentialSimpleMoves: Move[] = pieceIndicesForColor.reduce(
    (potentials, originIndex) =>
      potentials.concat(getPotentialSimpleMoves(originIndex)),
    [] as Move[]
  );
  const legalSimpleMoves = potentialSimpleMoves.filter(move =>
    isMoveLegal(playingSquaresState, move)
  );
  return legalSimpleMoves;
};

export const getAllLegalJumpMoves = (playingSquaresState: PlayingSquaresState, color: Color): Move[] => {
  const pieceIndicesForColor = getPiecePlayingSquareIndicesForColor(playingSquaresState, color);
  const potentialJumpMoves: Move[] = pieceIndicesForColor.reduce(
    (potentials, originIndex) =>
      potentials.concat(getPotentialJumpMoves(originIndex)),
    [] as Move[]
  );
  const legalJumpMoves = potentialJumpMoves.filter(move =>
    isMoveLegal(playingSquaresState, move)
  );
  return legalJumpMoves;
};

export const getMaybeJumpMove = (originIndex: number, direction: Direction): MaybeMove => ({
  from: originIndex,
  to: getJumpPlayingSquareIndex(originIndex, direction)
});

export const getPotentialJumpMoves = (originIndex: number): Move[] =>
  directions
    .map(direction => getMaybeJumpMove(originIndex, direction))
    .filter(isJustAMove);

export const getMoveTypeAndDirection = (move: Move): MoveTypeAndDirection | null => {
  const simpleMoveDirection = directions.find(direction =>
    getMaybeSimpleMove(move.from, direction).to === move.to
  );
  if (simpleMoveDirection) {
    return {
      direction: simpleMoveDirection,
      type: 'simple move'
    };
  }
  const jumpMoveDirection = directions.find(direction =>
    getMaybeJumpMove(move.from, direction).to === move.to
  );
  if (jumpMoveDirection) {
    return {
      direction: jumpMoveDirection,
      type: 'jump move'
    }
  }
  return null;
};

export const directionIsForward = (direction: Direction, color: Color): boolean =>
  color === red
    ? direction === sw || direction === se
    : direction === nw || direction === ne;

export const isMoveLegal = (playingSquaresState: PlayingSquaresState, move: Move): boolean => {
  const pieceAtOrigin = playingSquaresState[move.from];
  const pieceAtDestination = playingSquaresState[move.to];

  if (!pieceAtOrigin || pieceAtDestination) {
    return false;
  }

  const moveTypeAndDirection = getMoveTypeAndDirection(move);

  if (!moveTypeAndDirection) {
    return false;
  }

  const { type, direction } = moveTypeAndDirection;

  if (
    pieceAtOrigin.rank === man &&
    !directionIsForward(direction, pieceAtOrigin.color)
  ) {
    return false;
  }

  if (type === 'jump move') {
    const jumpedIndex = getAdjacentPlayingSquareIndex(move.from, direction);
    if (!jumpedIndex) {
      return false;
    }
    const jumpedPiece = playingSquaresState[jumpedIndex];
    if (
      !jumpedPiece ||
      jumpedPiece.color === pieceAtOrigin.color
    ) {
      return false;
    }
  }

  return true;
};

export const indexIsInKingsRow = (index: number, color: Color): boolean =>
  color === 'red'
    ? maxPlayingSquareIndex - playingSquaresPerRow < index &&
      index <= maxPlayingSquareIndex
    : 0 <= index &&
      index < playingSquaresPerRow;

export const physicalLocationToPlayingSquareIndex = (physical: PhysicalLocation): number | null => {
  const rowIsEven = physical.rowIndex % 2 === 0;
  const columnIsEven = physical.columnIndex % 2 === 0;
  const isPlayingSquare =
    (rowIsEven && !columnIsEven) ||
    (!rowIsEven && columnIsEven);
  if (!isPlayingSquare) {
    return null;
  }
  const playingSquareColumn = rowIsEven
    ? (physical.columnIndex - 1) / 2
    : physical.columnIndex / 2;
  return playingSquareColumn + physical.rowIndex * playingSquaresPerRow;
};

export const playingSquareIndexToPhysicalLocation = (playingSquareIndex: number): PhysicalLocation | null => {
  if (!playingSquareIndexIsInBounds(playingSquareIndex)) {
    return null;
  }

  const rowIndex = Math.floor(playingSquareIndex / playingSquaresPerRow);
  const columnIndex = playingSquareIndexIsInEvenRow(playingSquareIndex)
    ? (playingSquareIndex % playingSquaresPerRow) * 2 + 1
    : (playingSquareIndex % playingSquaresPerRow) * 2;

  return { rowIndex, columnIndex };
};

export const createSimpleMoveAction = (
  playingSquaresState: PlayingSquaresState,
  move: Move,
  // This is optional because in most cases we should already have
  // validated the move before creating an action from it
  validate = true
): PlayerAction<SimpleMoveActionType> => {
  const pieceAtOrigin = playingSquaresState[move.from];
  if (
    !pieceAtOrigin || (
      validate &&
      !isMoveLegal(playingSquaresState, move)  
    )
  ) {
    throw new Error('Illegal move');
  }

  const resultantPlayingSquaresState: PlayingSquaresState = [ ...playingSquaresState ];
  resultantPlayingSquaresState[move.from] = null;
  resultantPlayingSquaresState[move.to] = indexIsInKingsRow(move.to, pieceAtOrigin.color)
    ? { ...pieceAtOrigin, rank: 'king' }
    : pieceAtOrigin;

  const opponentColor: Color = pieceAtOrigin.color === 'red'
    ? 'white'
    : 'red';

  const remainingOpponentMoves = [
    ...getAllLegalJumpMoves(resultantPlayingSquaresState, opponentColor),
    ...getAllLegalSimpleMoves(resultantPlayingSquaresState, opponentColor)
  ];

  const opponentHasNoRemainingMoves = remainingOpponentMoves.length === 0;

  const resultantWinner = opponentHasNoRemainingMoves
    ? pieceAtOrigin.color
    : null;

  return {
    type: 'simple move',
    color: pieceAtOrigin.color,
    move,
    resultantPlayingSquaresState,
    // Only jump moves can perpetuate a turn
    endsTurn: true,
    endsGame: opponentHasNoRemainingMoves,
    resultantWinner
  }
};

export const createJumpMoveAction = (
  playingSquaresState: PlayingSquaresState,
  move: Move,
  // This is optional because in most cases we should already have
  // validated the move before creating an action from it
  validate = true
): PlayerAction<JumpMoveActionType> => {
  const pieceAtOrigin = playingSquaresState[move.from];
  const moveTypeAndDirection = getMoveTypeAndDirection(move);
  if (
    !pieceAtOrigin ||
    !moveTypeAndDirection || (
      validate &&
      !isMoveLegal(playingSquaresState, move)  
    )
  ) {
    throw new Error('Illegal move');
  }

  const { direction } = moveTypeAndDirection;
  const jumpedIndex = getAdjacentPlayingSquareIndex(move.from, direction) as number;
  const resultantPlayingSquaresState: PlayingSquaresState = [ ...playingSquaresState ];
  resultantPlayingSquaresState[move.from] = null;

  const isPromotion = indexIsInKingsRow(move.to, pieceAtOrigin.color)
  resultantPlayingSquaresState[move.to] = isPromotion
    ? { ...pieceAtOrigin, rank: 'king' }
    : pieceAtOrigin;

  resultantPlayingSquaresState[jumpedIndex] = null;
  const nextJumpsForPiece = getAllLegalJumpMoves(resultantPlayingSquaresState, pieceAtOrigin.color)
    .filter(nextJump => nextJump.from === move.to)

  const endsTurn = isPromotion || !nextJumpsForPiece.length;

  const opponentColor: Color = pieceAtOrigin.color === 'red'
    ? 'white'
    : 'red';

  const remainingOpponentMoves = [
    ...getAllLegalJumpMoves(resultantPlayingSquaresState, opponentColor),
    ...getAllLegalSimpleMoves(resultantPlayingSquaresState, opponentColor)
  ];

  const opponentHasNoRemainingMoves = remainingOpponentMoves.length === 0;
  const endsGame = endsTurn && opponentHasNoRemainingMoves;
  const resultantWinner = endsGame
    ? pieceAtOrigin.color
    : null;

  return {
    type: 'jump move',
    color: pieceAtOrigin.color,
    move,
    resultantPlayingSquaresState,
    endsTurn,
    endsGame,
    resultantWinner
  }
};
