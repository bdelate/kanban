import { normalize, schema } from 'normalizr';

const card = new schema.Entity('cards');
const cardArray = [card];
const column = new schema.Entity('columns', {
  cards: [card]
});
const columnArray = [column];
const board = new schema.Entity('boards', {
  columns: [column]
});

export function normalizeBoard(data) {
  return normalize(data, board);
}

export function normalizeColumn(data) {
  return normalize(data, columnArray);
}

export function normalizeCards(data) {
  return normalize(data, cardArray);
}
