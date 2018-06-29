export const overwriteCards = cards => {
  return {
    type: 'OVERWRITE_CARDS',
    cards: cards
  };
};

export const cardDeleted = (column_id, id) => {
  return {
    type: 'CARD_DELETED',
    column_id,
    id: id
  };
};
