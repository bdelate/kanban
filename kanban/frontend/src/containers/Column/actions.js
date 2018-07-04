// project imports
import { toggleInfoModal } from '../Home/actions';
import { normalizeColumn, normalizeCards } from '../../utilities/normalizer';
import * as cardActions from '../Card/actions';

// 3rd party imports
import axios from 'axios';

export const overwriteColumns = columns => {
  return {
    type: 'OVERWRITE_COLUMNS',
    columns: columns
  };
};

export const toggleSpinner = (id, displaySpinner) => {
  return {
    type: 'TOGGLE_COLUMN_SPINNER',
    id: id,
    spinner: displaySpinner
  };
};

export const columnRenamed = (id, name) => {
  return {
    type: 'COLUMN_RENAMED',
    id: id,
    name: name
  };
};

export const columnDeleted = id => {
  return {
    type: 'COLUMN_DELETED',
    id: id
  };
};

export const renameColumn = (id, name) => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    const data = { id: id, name: name };
    axios
      .patch(`/api/columns/${id}/`, { ...data })
      .then(res => {
        dispatch(toggleSpinner(id, false));
        dispatch(columnRenamed(res.data.id, res.data.name));
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to update column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

// if last column was deleted, only that column is removed from server, board
// and column store. If non last column was deleted, remaining columns are
// overwritten to reflect their updated position_ids received from the server
export const deleteColumn = id => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    axios
      .delete(`/api/columns/${id}/`)
      .then(res => {
        dispatch(columnDeleted(id));
        if (res.data !== '') {
          const normalizedData = normalizeColumn(res.data);
          dispatch(overwriteColumns(normalizedData.entities.columns));
        }
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to delete column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const cardCreated = card => {
  return {
    type: 'CARD_CREATED',
    card: card
  };
};

export const createCard = card => {
  return dispatch => {
    dispatch(cardCreated(card));
    axios
      .post(`/api/cards/`, card)
      .then(res => {
        dispatch(cardActions.cardDeleted(card.column_id, card.id));
        dispatch(cardCreated(res.data));
      })
      .catch(error => {
        dispatch(cardActions.cardDeleted(card.column_id, card.id));
        const message = 'Error: Unable to create card on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const cardsReordered = args => {
  return {
    type: 'CARDS_REORDERED',
    column_id: args.column_id,
    fromCardIndex: args.fromCardIndex,
    toCardIndex: args.toCardIndex
  };
};

// reorder cards locally (ie: store) while drag is still in progress.
// when a card is dropped, the server is updated after which the store
// is upated to reflect the new position_ids
export const reorderCards = args => {
  return dispatch => {
    if (!args.hasDropped) {
      dispatch(cardsReordered(args));
    } else {
      dispatch(cardActions.toggleSpinner(args.cardId, true));
      const cards = args.cards;
      axios
        .patch(`/api/cards/`, { cards })
        .then(res => {
          const normalizedData = normalizeCards(res.data);
          dispatch(cardActions.cardsUpdated(normalizedData.entities.cards));
        })
        .catch(error => {
          dispatch(cardActions.toggleSpinner(args.cardId, false));
          const message = 'Error: Unable to update card on the server';
          dispatch(toggleInfoModal(message));
        });
    }
  };
};

export const cardMoved = args => {
  return {
    type: 'CARD_MOVED',
    fromColumnId: args.fromColumnId,
    toColumnId: args.toColumnId,
    cardId: args.cardId
  };
};

// move card to a different column. Update moved card details along with
// position ids of cards in original column
export const moveCard = args => {
  return (dispatch, getState) => {
    dispatch(cardMoved(args));
    dispatch(cardActions.toggleSpinner(args.cardId, true));

    // create array of fromColumn cards with updated position ids
    const cards = getState().columns[args.fromColumnId].cards.map(
      (id, index) => {
        return { id: id, position_id: index };
      }
    );

    // append updated details for moved card to cards array
    cards.push({
      id: args.cardId,
      column_id: args.toColumnId,
      position_id: args.toPositionId
    });

    // update server, then update store to reflect teh udpated position ids
    axios
      .patch(`/api/cards/`, { cards })
      .then(res => {
        const normalizedData = normalizeCards(res.data);
        dispatch(cardActions.cardsUpdated(normalizedData.entities.cards));
      })
      .catch(error => {
        dispatch(cardActions.toggleSpinner(args.cardId, false));
        const message = 'Error: Unable to update card on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};
