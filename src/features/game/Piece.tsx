import { ReactElement } from 'react';
import styles from './Piece.module.css';

import {
  Color,
  Piece as Props,
  Rank
} from './types';

// TODO: This is kind of brittle to have these baked in. Use a webpack
// loader so these can be stored as separate files for easier editing
// and potentially additional optimizations can be applied.
const redMan = <svg xmlns="http://www.w3.org/2000/svg" className={styles.piece} viewBox="0 0 75 50.37"><path d="M87.26,64.3C87.26,74.05,70.86,82,50.63,82S14,74.05,14,64.3V49.5H87.26Z" transform="translate(-13 -32.08)" fill="red" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.5" cy="18.15" rx="37" ry="17.65" fill="red" stroke="#000" strokeMiterlimit="10"/></svg>
const redKing = <svg xmlns="http://www.w3.org/2000/svg"  className={styles.piece} viewBox="0 0 75.08 63.38"><path d="M87.26,64.3C87.26,74.05,70.86,82,50.63,82S14,74.05,14,64.3V49.5H87.26Z" transform="translate(-12.92 -19.07)" fill="red" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.58" cy="31.16" rx="37" ry="17.65" fill="red" stroke="#000" strokeMiterlimit="10"/><path d="M87.19,51.29c0,9.75-16.4,17.65-36.63,17.65S13.92,61,13.92,51.29V36.49H87.19Z" transform="translate(-12.92 -19.07)" fill="red" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.5" cy="18.15" rx="37" ry="17.65" fill="red" stroke="#000" strokeMiterlimit="10"/></svg>
const whiteMan = <svg xmlns="http://www.w3.org/2000/svg"  className={styles.piece} viewBox="0 0 75 50.37"><path d="M87.26,64.3C87.26,74.05,70.86,82,50.63,82S14,74.05,14,64.3V49.5H87.26Z" transform="translate(-13 -32.08)" fill="#fff" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.5" cy="18.15" rx="37" ry="17.65" fill="#fff" stroke="#000" strokeMiterlimit="10"/></svg>
const whiteKing = <svg xmlns="http://www.w3.org/2000/svg"  className={styles.piece} viewBox="0 0 75.08 63.38"><path d="M87.26,64.3C87.26,74.05,70.86,82,50.63,82S14,74.05,14,64.3V49.5H87.26Z" transform="translate(-12.92 -19.07)" fill="#fff" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.58" cy="31.16" rx="37" ry="17.65" fill="red" stroke="#000" strokeMiterlimit="10"/><path d="M87.19,51.29c0,9.75-16.4,17.65-36.63,17.65S13.92,61,13.92,51.29V36.49H87.19Z" transform="translate(-12.92 -19.07)" fill="#fff" stroke="#000" strokeMiterlimit="10"/><ellipse cx="37.5" cy="18.15" rx="37" ry="17.65" fill="#fff" stroke="#000" strokeMiterlimit="10"/></svg>

type SvgLookup = Record<Color, Record<Rank, ReactElement>>
const svgLookup: SvgLookup = {
  red: {
    man: redMan,
    king: redKing
  },
  white: {
    man: whiteMan,
    king: whiteKing
  }
};

export default function Piece(props: Props) {
  return svgLookup[props.color][props.rank];
};
