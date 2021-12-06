export type Color =
  'red' |
  'white'

export type Rank =
  'man' |
  'king'

export interface Piece {
  color: Color,
  rank: Rank
}

export type PlayingSquaresState = Array<Piece | null>

export type Direction = 'nw' | 'ne' | 'se' | 'sw'

export interface Move {
  from: number,
  to: number
}

export interface OutOfBoundsMove {
  from: number,
  to: null
}

export type MaybeMove = Move | OutOfBoundsMove

export type SimpleMoveActionType = 'simple move'
export type JumpMoveActionType = 'jump move'
export type MoveActionType = SimpleMoveActionType | JumpMoveActionType
export type ResignationActionType = 'resignation'
export type PlayerActionType = MoveActionType | ResignationActionType
export interface PlayerAction<T extends PlayerActionType> {
  color: Color,
  type: T,
  move: Move | null,
  resultantPlayingSquaresState: PlayingSquaresState,
  endsTurn: boolean,
  endsGame: boolean,
  resultantWinner: Color | null
}

export interface MoveTypeAndDirection {
  type: MoveActionType,
  direction: Direction
}

export interface GameState {
  initialPlayingSquaresState: PlayingSquaresState,
  playerActions: PlayerAction<PlayerActionType>[],
  selectedPlayingSquareIndex: number | null
}

export type PhysicalSquare = {
  playingSquareIndex: number,
  piece: Piece | null
} | null

export interface PhysicalLocation {
  rowIndex: number,
  columnIndex: number
}

export type PhysicalBoardState = PhysicalSquare[][]
