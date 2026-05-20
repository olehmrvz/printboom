import { Photo } from "@/types";

export interface CollageCell {
  x: number;
  y: number;
  width: number;
  height: number;
  photoIndex: number;
}

export interface CollageInput {
  photos: { id: string; src: string }[];
  columns: number;
  layoutPreset: string;
}

function snapX(col: number, cols: number, tw: number): number {
  return Math.round((col / cols) * tw);
}

function snapY(row: number, rows: number, th: number): number {
  return Math.round((row / rows) * th);
}

function layoutGrid(count: number, tw: number, th: number): CollageCell[] {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cells: CollageCell[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = snapX(col, cols, tw);
    const nextX = col === cols - 1 ? tw : snapX(col + 1, cols, tw);
    const y = snapY(row, rows, th);
    const nextY = row === rows - 1 ? th : snapY(row + 1, rows, th);
    cells.push({
      x,
      y,
      width: nextX - x,
      height: nextY - y,
      photoIndex: i,
    });
  }
  return cells;
}

function layoutGrid4x3(count: number, tw: number, th: number): CollageCell[] {
  const cols = 4;
  const rows = Math.ceil(count / cols);
  const cells: CollageCell[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = snapX(col, cols, tw);
    const nextX = col === cols - 1 ? tw : snapX(col + 1, cols, tw);
    const y = snapY(row, rows, th);
    const nextY = row === rows - 1 ? th : snapY(row + 1, rows, th);
    cells.push({
      x,
      y,
      width: nextX - x,
      height: nextY - y,
      photoIndex: i,
    });
  }
  return cells;
}

function layoutColumn2(count: number, tw: number, th: number): CollageCell[] {
  const cells: CollageCell[] = [];
  let idx = 0;
  const cols = 2;
  const rows = Math.ceil(count / cols);
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(cols, count - idx);
    const y = snapY(row, rows, th);
    const nextY = row === rows - 1 ? th : snapY(row + 1, rows, th);
    for (let c = 0; c < inRow; c++) {
      const x = snapX(c, cols, tw);
      const nextX = c === cols - 1 ? tw : snapX(c + 1, cols, tw);
      cells.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        photoIndex: idx,
      });
      idx++;
    }
  }
  return cells;
}

function layoutColumn3(count: number, tw: number, th: number): CollageCell[] {
  const cells: CollageCell[] = [];
  let idx = 0;
  const cols = 3;
  const rows = Math.ceil(count / cols);
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(cols, count - idx);
    const y = snapY(row, rows, th);
    const nextY = row === rows - 1 ? th : snapY(row + 1, rows, th);
    for (let c = 0; c < inRow; c++) {
      const x = snapX(c, cols, tw);
      const nextX = c === cols - 1 ? tw : snapX(c + 1, cols, tw);
      cells.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        photoIndex: idx,
      });
      idx++;
    }
  }
  return cells;
}

function layoutHero(count: number, tw: number, th: number): CollageCell[] {
  const cells: CollageCell[] = [];
  const heroH = Math.round(th * 0.45);
  cells.push({ x: 0, y: 0, width: tw, height: heroH, photoIndex: 0 });
  const rem = count - 1;
  if (rem > 0) {
    const cols = 2;
    const rows = Math.ceil(rem / cols);
    const remainingH = th - heroH;
    for (let i = 0; i < rem; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = snapX(col, cols, tw);
      const nextX = col === cols - 1 ? tw : snapX(col + 1, cols, tw);
      const y = heroH + snapY(row, rows, remainingH);
      const nextY = row === rows - 1 ? th : heroH + snapY(row + 1, rows, remainingH);
      cells.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        photoIndex: i + 1,
      });
    }
  }
  return cells;
}

function layoutEditorial(count: number, tw: number, th: number): CollageCell[] {
  const schemas: Record<number, number[][]> = {
    6: [[2], [2], [2]],
    7: [[2], [3], [2]],
    8: [[2], [3], [3]],
    9: [[3], [3], [3]],
    10: [[2], [3], [3], [2]],
    11: [[3], [3], [3], [2]],
    12: [[3], [3], [3], [3]],
  };
  const schema = schemas[count] || [[3], [3], [3], [3]];
  const cells: CollageCell[] = [];
  let idx = 0;
  const numRows = schema.length;
  for (let r = 0; r < numRows; r++) {
    const inRow = Math.min(schema[r][0], count - idx);
    if (inRow <= 0) break;
    const y = snapY(r, numRows, th);
    const nextY = r === numRows - 1 ? th : snapY(r + 1, numRows, th);
    for (let c = 0; c < inRow; c++) {
      const x = Math.round((c / inRow) * tw);
      const nextX = c === inRow - 1 ? tw : Math.round(((c + 1) / inRow) * tw);
      cells.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        photoIndex: idx,
      });
      idx++;
    }
  }
  return cells;
}

function centerRows(cells: CollageCell[], totalWidth: number): CollageCell[] {
  if (cells.length === 0) return cells;

  // Group cells by row (same y position)
  const rowMap = new Map<number, CollageCell[]>();
  for (const cell of cells) {
    const row = rowMap.get(cell.y) || [];
    row.push(cell);
    rowMap.set(cell.y, row);
  }

  const result: CollageCell[] = [];
  for (const [, rowCells] of rowMap) {
    rowCells.sort((a, b) => a.x - b.x);
    const rowLeft = rowCells[0].x;
    const rowRight = rowCells[rowCells.length - 1].x + rowCells[rowCells.length - 1].width;
    const rowWidth = rowRight - rowLeft;
    const offsetX = Math.round((totalWidth - rowWidth) / 2);

    for (const cell of rowCells) {
      result.push({ ...cell, x: cell.x + offsetX });
    }
  }

  return result;
}

export function generateCollageGrid(
  input: CollageInput,
  tw: number,
  th: number
): CollageCell[] {
  const { photos, layoutPreset } = input;
  const count = photos.length;
  if (count === 0) return [];

  let cells: CollageCell[];
  switch (layoutPreset) {
    case "grid-4x3":
      cells = layoutGrid4x3(count, tw, th);
      break;
    case "grid":
      cells = layoutGrid(count, tw, th);
      break;
    case "column-2":
      cells = layoutColumn2(count, tw, th);
      break;
    case "column-3":
      cells = layoutColumn3(count, tw, th);
      break;
    case "hero":
      cells = layoutHero(count, tw, th);
      break;
    case "editorial":
    default:
      cells = layoutEditorial(count, tw, th);
      break;
  }

  return centerRows(cells, tw);
}
