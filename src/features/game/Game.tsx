import classNames from 'classnames';
import Piece from './Piece';
import styles from './Game.module.css';

import {
  JumpMoveActionType,
  PhysicalLocation,
  PhysicalSquare,
  PlayerAction,
  SimpleMoveActionType
} from './types';

import {
  useAppSelector,
  useAppDispatch
} from '../../app/hooks';

import {
  selectPhysicalSquare,
  selectCurrentPhysicalBoardState,
  selectSelectedPhysicalLocation,
  selectWhoseTurn,
  selectCurrentValidMoveActions,
  selectGameState,
  makeMove,
  selectLastPlayerAction
} from './gameSlice';
import { physicalLocationToPlayingSquareIndex } from './utilities';

export function Game() {
  const gameState = useAppSelector(selectGameState);
  const whoseTurn = useAppSelector(selectWhoseTurn);
  const lastPlayerAction = useAppSelector(selectLastPlayerAction);
  const boardRows = useAppSelector(selectCurrentPhysicalBoardState);
  const selectedPhysicalSquare = useAppSelector(selectSelectedPhysicalLocation);
  // Have to do some modest type widening to make
  // `validMoveActions.find()` callable
  const validMoveActions = useAppSelector(selectCurrentValidMoveActions) as Array<PlayerAction<SimpleMoveActionType | JumpMoveActionType>>;
  const dispatch = useAppDispatch();

  const getSquareClassName = (square: PhysicalSquare, location: PhysicalLocation): string => {
    const isSelected =
      selectedPhysicalSquare &&
      selectedPhysicalSquare.rowIndex === location.rowIndex &&
      selectedPhysicalSquare.columnIndex === location.columnIndex;

    const variantStyle = square
      ? isSelected
        ? styles.gameSquareSelected
        : styles.gameSquarePlaying
      : styles.gameSquareNonPlaying;

    return classNames(styles.gameSquare, variantStyle);
  };

  const onSquareClick = (location: PhysicalLocation): void => {
    const isAlreadySelected =
      selectedPhysicalSquare &&
      selectedPhysicalSquare.rowIndex === location.rowIndex &&
      selectedPhysicalSquare.columnIndex === location.columnIndex;

    const newSelectedSquare = boardRows[location.rowIndex][location.columnIndex];
    const isPieceOfCurrentPlayer = newSelectedSquare?.piece?.color === whoseTurn;

    const clickedPlayingSquareIndex = physicalLocationToPlayingSquareIndex(location);
    const validMoveAction = validMoveActions.find(action =>
      action.move?.from === gameState.selectedPlayingSquareIndex &&
      action.move?.to === clickedPlayingSquareIndex
    );
    const validMove = validMoveAction?.move;

    const action = 
      // Click from a valid square to a valid destination to make a move
      validMove
        ? makeMove(validMove)
        // Click twice to de-select
        : isAlreadySelected ||
          // Click anything but a piece of the current player to de-select
          !isPieceOfCurrentPlayer
          ? selectPhysicalSquare(null)
          : selectPhysicalSquare(location);

    dispatch(action);
  };

  return (
    <div className="{styles.game}">
      <table>
        <tbody>
          {boardRows.map((row, rowIndex) =>
            <tr key={`[${ rowIndex }]`}>
              {row.map((square, columnIndex) =>
                <td
                  key={`[${ rowIndex }][${ columnIndex }]`}
                  className={getSquareClassName(square, { rowIndex, columnIndex })}
                  onClick={() => onSquareClick({ rowIndex, columnIndex })}
                >
                  {square && square.piece &&
                    <Piece
                      color={square.piece.color}
                      rank={square.piece.rank}
                    />
                  }
                  <span className={styles.squareIndex}>{physicalLocationToPlayingSquareIndex({ rowIndex, columnIndex })}</span>
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      <div>Turn: {whoseTurn || 'none'}</div>
      <div>
        Valid moves:
        {validMoveActions.map(action => `${ action.move?.from } → ${ action.move?.to }`).join(', ')}
      </div>
      <div>Winner: {lastPlayerAction?.resultantWinner || 'none'}</div>
    </div>
  );
}
