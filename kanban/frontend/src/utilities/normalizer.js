import { normalize, schema } from 'normalizr';

const card = new schema.Entity('cards');
const column = new schema.Entity('columns', {
  cards: [card]
});
const board = new schema.Entity('boards', {
  columns: [column]
});

export function normalizeBoard(data) {
  return normalize(data, board);
}
