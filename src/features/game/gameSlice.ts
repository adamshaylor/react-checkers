import {
  createSlice,
  createSelector,
  PayloadAction
} from '@reduxjs/toolkit';

import {
  Color,
  GameState,
  JumpMoveActionType,
  Move,
  MoveActionType,
  PhysicalBoardState,
  PhysicalLocation,
  PlayerAction,
  PlayerActionType
} from './types';

import { RootState } from '../../app/store';

import {
  rm,
  playingSquaresPerRow,
  wm,
  red,
  white
} from './constants';

import {
  createJumpMoveAction,
  createSimpleMoveAction,
  getAllLegalJumpMoves,
  getAllLegalSimpleMoves,
  getCurrentPlayingSquaresState,
  getLastPlayerAction,
  getMoveTypeAndDirection,
  getPiecePlayingSquareIndicesForColor,
  physicalLocationToPlayingSquareIndex,
  playingSquareIndexToPhysicalLocation
} from './utilities';


/**
 * Initial state & reducers
 */

const initialState: GameState = {
  initialPlayingSquaresState: [
      rm, rm, rm, rm,
    rm, rm, rm, rm,
      rm, rm, rm, rm,
    null, null, null, null,
      null, null, null, null,
    wm, wm, wm, wm,
      wm, wm, wm, wm,
    wm, wm, wm, wm
  ],
  playerActions: [],
  selectedPlayingSquareIndex: null
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    makeMove: (gameState: GameState, action: PayloadAction<Move>) => {
      const move = action.payload;
      const moveTypeAndDirection = getMoveTypeAndDirection(move);

      if (!moveTypeAndDirection) {
        throw new Error('Illegal move');
      }

      // For the benefit of type inference
      const jumpMove: JumpMoveActionType = 'jump move';
      const playingSquaresState = getCurrentPlayingSquaresState(gameState);
      const playerAction = moveTypeAndDirection.type === jumpMove
        ? createJumpMoveAction(playingSquaresState, move)
        : createSimpleMoveAction(playingSquaresState, move);

      return {
        ...gameState,
        playerActions: [
          ...gameState.playerActions,
          playerAction
        ],
        selectedPlayingSquareIndex: null
      };
    },
    selectPhysicalSquare(gameState: GameState, action: PayloadAction<PhysicalLocation | null>) {
      return {
        ...gameState,
        selectedPlayingSquareIndex: action.payload
          ? physicalLocationToPlayingSquareIndex(action.payload)
          : null
      };
    }
  }
});


/**
 * Selectors
 */

export const selectGameState = (state: RootState): GameState => state.game;

export const selectLastPlayerAction = (state: RootState): PlayerAction<PlayerActionType> | null =>
  getLastPlayerAction(state.game);

export const selectLastMovePlayerAction = (state: RootState): PlayerAction<MoveActionType> | null => {
  const moveActions = state.game.playerActions.filter(action =>
    action.type === 'simple move' ||
    action.type === 'jump move'
  ) as PlayerAction<MoveActionType>[];
  return moveActions.slice(-1)[0] || null;
};

export const selectPlayerColor = (_: RootState, playerColor: Color): Color =>
  playerColor;

export const selectSelectedPhysicalLocation = (state: RootState): PhysicalLocation | null =>
  typeof state.game.selectedPlayingSquareIndex === 'number'
    ? playingSquareIndexToPhysicalLocation(state.game.selectedPlayingSquareIndex)
    : null;

export const selectGameOver = createSelector(
  [ selectLastPlayerAction ],
  lastPlayerAction => lastPlayerAction
    ? lastPlayerAction.endsGame
    : false
);

export const selectWhoseTurn = createSelector(
  [ selectLastPlayerAction ],
  lastPlayerAction => {
    if (!lastPlayerAction) {
      return red;
    }
    if (lastPlayerAction.endsGame) {
      return null;
    }
    if (lastPlayerAction.endsTurn) {
      return lastPlayerAction.color === red
        ? white
        : red;
    }
    return lastPlayerAction.color;
  }
);

export const selectCurrentPlayingSquaresState = createSelector(
  [ selectGameState, selectLastPlayerAction ],
  (gameState, lastPlayerAction) => lastPlayerAction
    ? lastPlayerAction.resultantPlayingSquaresState
    : gameState.initialPlayingSquaresState
);

export const selectCaptureCountByPlayer = createSelector(
  [ selectGameState, selectPlayerColor ],
  (gameState, playerColor) => gameState.playerActions.reduce(
    (count, action) =>
      action.type === 'jump move' &&
      action.color === playerColor
        ? count + 1
        : count,
    0
  )
);

export const selectCurrentPlayerBoardIndices = createSelector(
  [ selectCurrentPlayingSquaresState, selectWhoseTurn ],
  (playingSquaresState, whoseTurn) =>
    whoseTurn
      ? getPiecePlayingSquareIndicesForColor(playingSquaresState, whoseTurn)
      : []
);

export const selectCurrentValidMoveActions = createSelector(
  [ selectWhoseTurn, selectLastMovePlayerAction, selectCurrentPlayingSquaresState ],
  (whoseTurn, lastMoveAction, playingSquaresState) => {
    if (!whoseTurn) {
      return [];
    }

    const isStartOfMultiJump =
      lastMoveAction?.color === whoseTurn &&
      lastMoveAction?.type === 'jump move';

    const legalJumpMoves = getAllLegalJumpMoves(playingSquaresState, whoseTurn);
    const legalJumpMoveActions = legalJumpMoves
      .filter(move =>
        isStartOfMultiJump
          ? lastMoveAction?.move?.to === move.from
          : move
      )
      .map(move =>
        createJumpMoveAction(playingSquaresState, move, false)
      );

    // Jumping is mandatory:
    // https://en.wikipedia.org/wiki/English_draughts#Move_rules
    if (legalJumpMoveActions.length) {
      return legalJumpMoveActions;
    }

    const legalSimpleMoves = getAllLegalSimpleMoves(playingSquaresState, whoseTurn);
    const legalSimpleMoveActions = legalSimpleMoves.map(move =>
      createSimpleMoveAction(playingSquaresState, move, false)
    );

    return legalSimpleMoveActions;
  }
);

export const selectCurrentPhysicalBoardState = createSelector(
  [ selectCurrentPlayingSquaresState ],
  (playingSquaresState) => {
    const rows: PhysicalBoardState = Array.from({ length: playingSquaresPerRow * 2 }, (_, physicalRowIndex) =>
      Array.from({ length: playingSquaresPerRow * 2 }, (_, physicalColumnIndex) => {
        const playingSquareIndex = physicalLocationToPlayingSquareIndex({
          rowIndex: physicalRowIndex,
          columnIndex: physicalColumnIndex
        });
        return playingSquareIndex !== null
          ? { playingSquareIndex, piece: playingSquaresState[playingSquareIndex] }
          : null;
      })
    );
    return rows;
  }
);

export const {
  makeMove,
  selectPhysicalSquare
} = gameSlice.actions;

export default gameSlice.reducer;
