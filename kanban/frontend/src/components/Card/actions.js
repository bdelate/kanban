// project imports
import { toggleInfoModal } from '../../containers/Home/actions';
import { normalizeCards } from '../../utilities/normalizer';

// 3rd party imports
import axios from 'axios';

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

export const cardsUpdated = cards => {
  return {
    type: 'CARDS_UPDATED',
    cards: cards
  };
};

export const toggleSpinner = (id, displaySpinner) => {
  return {
    type: 'TOGGLE_CARD_SPINNER',
    id: id,
    spinner: displaySpinner
  };
};

// if last card was deleted, only that card is removed from server and store
// If non last card was deleted, remaining cards are updated to reflect their
// updated position_ids received from the server
export const deleteCard = (column_id, id) => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    axios
      .delete(`/api/cards/${id}/`)
      .then(res => {
        dispatch(cardDeleted(column_id, id));
        if (res.data !== '') {
          const normalizedData = normalizeCards(res.data);
          dispatch(cardsUpdated(normalizedData.entities.cards));
        }
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to delete card on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const updateCard = (id, task) => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    axios
      .patch(`/api/cards/${id}/`, { task: task })
      .then(res => {
        const card = {
          [res.data.id]: res.data
        };
        dispatch(cardsUpdated(card));
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to update card on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};
