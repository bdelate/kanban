// react imports
import React, { Component, Fragment } from 'react';

// project imports
import Column from '../Column/Column';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';
import ColumnCreateUpdate from '../../components/Modals/ColumnCreateUpdate';
import CardCreateUpdate from '../../components/Modals/CardCreateUpdate';
import Spinner from '../../components/Spinner/Spinner';
import Info from '../../components/Modals/Info';
import Confirm from '../../components/Modals/Confirm';
import BoardControls from '../../containers/BoardControls/BoardControls';
import { connect } from 'react-redux';
import * as actions from './actions';

// 3rd party imports
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import axios from 'axios';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
  authToken: PropTypes.string.isRequired
};

const BoardContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 10px;
  background-color: #c3d9e8;
  border-radius: 2px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {
  state = {
    confirmModal: {
      message: null,
      confirmFunction: null
    },
    columnCreateUpdate: {
      active: false,
      columnIndex: -1
    },
    cardCreateUpdate: {
      active: false,
      columnIndex: -1,
      cardIndex: -1
    },
    previousState: {}
  };

  // set auth token and retrieve data on initial mount
  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = `JWT ${
      this.props.authToken
    }`;
    this.props.getBoard(this.props.id);
  }

  // called when the props change (eg: a different boardId was selected)
  static getDerivedStateFromProps(nextProps, prevState) {
    return { ...nextProps };
  }

  // if board id has changed, call retrieveData to laod the new board
  componentDidUpdate(prevProps, prevState) {
    if (prevState.id !== this.props.id) {
      this.props.getBoard(this.props.id);
    }
  }

  // retrieve all board data from the server
  async retrieveData() {
    this.setState({ retrievingData: true });
    await axios
      .get(`/api/boards/${this.props.id}/`)
      .then(res => {
        this.setState(
          {
            ...res.data,
            ...this.state,
            retrievingData: false,
            columns: res.data.columns
          },
          this.savePreviousState
        );
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        this.setState({ retrievingData: false });
        this.toggleInfoHandler(message);
      });
  }

  // make a deep copy of the entire state and save it to state.previousState
  savePreviousState = () => {
    const currentState = { ...this.state };
    for (let column in this.state.columns) {
      currentState.columns[column] = { ...this.state.columns[column] };
      currentState.columns[column].cards = [
        ...this.state.columns[column].cards
      ];
      for (let card in this.state.columns[column].cards) {
        currentState.columns[column].cards[card] = {
          ...this.state.columns[column].cards[card]
        };
      }
    }
    delete currentState.previousState;
    this.setState({ previousState: currentState });
  };

  // collapse / uncollapse column
  toggleColumnHandler = columnIndex => {
    const column = { ...this.state.columns[columnIndex] };
    column.collapsed = !column.collapsed;
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  };

  // update all specified columns
  patchServerColumns = async columns => {
    await axios
      .patch(`/api/columns/`, { columns })
      .then(res => {
        this.savePreviousState();
      })
      //restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update columns on the server';
        this.toggleInfoHandler(message);
      });
  };

  // update all specified cards.
  // optionally display a card spinner if a spinnerCard is provided
  patchServerCards = async (cards, spinnerCard) => {
    if (spinnerCard) this.toggleCardSpinner(spinnerCard[0], spinnerCard[1]);
    await axios
      .patch(`/api/cards/`, { cards })
      .then(res => {
        if (spinnerCard) this.toggleCardSpinner(spinnerCard[0], spinnerCard[1]);
        this.savePreviousState();
      })
      //restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update cards on the server';
        this.toggleInfoHandler(message);
      });
  };

  // create new column on the server. Replace last column with response
  // to get db id and hide spinner
  postServerColumn = async column => {
    await axios
      .post(`/api/columns/`, column)
      .then(res => {
        this.setState(
          {
            ...this.state,
            columns: [
              ...this.state.columns.slice(0, res.data.position_id),
              { ...res.data }
            ]
          },
          this.savePreviousState
        );
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to create column on the server';
        this.toggleInfoHandler(message);
      });
  };

  // Update single card detail on the server
  patchServerCardDetail = async (columnIndex, cardIndex) => {
    this.toggleCardSpinner(columnIndex, cardIndex);
    const card = { ...this.state.columns[columnIndex].cards[cardIndex] };
    await axios
      .patch(`/api/cards/${card.id}/`, { ...card })
      .then(res => {
        this.toggleCardSpinner(columnIndex, cardIndex);
        this.savePreviousState();
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update card on the server';
        this.toggleInfoHandler(message);
      });
  };

  // create new card on the server, update state with response (to get db id)
  postServerCard = async (columnIndex, card) => {
    await axios
      .post(`/api/cards/`, card)
      .then(res => {
        const cardIndex = this.state.columns[columnIndex].cards.length - 1;
        this.setState(
          {
            ...this.state,
            columns: [
              ...this.state.columns.slice(0, columnIndex),
              {
                ...this.state.columns[columnIndex],
                cards: [
                  ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
                  { ...res.data }
                ]
              },
              ...this.state.columns.slice(columnIndex + 1)
            ]
          },
          this.savePreviousState
        );
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to create card on the server';
        this.toggleInfoHandler(message);
      });
  };

  // delete card on the server
  deleteServerCard = async cardId => {
    await axios
      .delete(`/api/cards/${cardId}/`)
      .then(res => {
        this.savePreviousState();
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to delete card on the server';
        this.toggleInfoHandler(message);
      });
  };

  // reorder cards within a column
  reorderCardHandler = ({
    hasDropped,
    columnIndex,
    fromCardIndex,
    toCardIndex
  }) => {
    // deep copy single column with all of its cards
    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    for (let card in this.state.columns[columnIndex].cards) {
      column.cards[card] = { ...this.state.columns[columnIndex].cards[card] };
    }

    // card has been dropped, update column on the server
    if (hasDropped) {
      const spinnerCard = [columnIndex, toCardIndex];
      this.patchServerCards(column.cards, spinnerCard);
    } else {
      // card hasn't been dropped yet, update local column state only
      // reorder card
      const card = column.cards.splice(fromCardIndex, 1)[0];
      column.cards.splice(toCardIndex, 0, card);

      // update position_ids
      for (let key in column.cards) {
        column.cards[key]['position_id'] = parseInt(key, 10);
      }

      this.setState({
        columns: [
          ...this.state.columns.slice(0, columnIndex),
          column,
          ...this.state.columns.slice(columnIndex + 1)
        ]
      });
    }
  };

  // move card to a different column
  moveCardHandler = (fromColumnIndex, fromCardIndex, toColumnIndex) => {
    // create deep copy of all columns
    const updatedState = { columns: [...this.state.columns] };
    for (let column in updatedState.columns) {
      updatedState.columns[column] = { ...this.state.columns[column] };
      updatedState.columns[column].cards = [
        ...this.state.columns[column].cards
      ];
      for (let card in this.state.columns[column].cards) {
        updatedState.columns[column].cards[card] = {
          ...this.state.columns[column].cards[card]
        };
      }
    }

    // remove card from fromColumnIndex
    const card = updatedState.columns[fromColumnIndex].cards.splice(
      fromCardIndex,
      1
    )[0];

    // update card column_id and position_id
    card.column_id = updatedState.columns[toColumnIndex].id;
    card.position_id = updatedState.columns[toColumnIndex].cards.length;

    // push card to toColumnIndex
    updatedState.columns[toColumnIndex].cards.push(card);

    // update card position ids in fromColumnIndex
    for (let key in updatedState.columns[fromColumnIndex].cards) {
      updatedState.columns[fromColumnIndex].cards[key][
        'position_id'
      ] = parseInt(key, 10);
    }

    // update state
    this.setState({ columns: updatedState.columns });

    // update server with changed cards, ie: moved card and cards in fromColumn
    const newCardIndex = updatedState.columns[toColumnIndex].cards.length - 1;
    const cards = [...updatedState.columns[fromColumnIndex].cards];
    cards.push(updatedState.columns[toColumnIndex].cards[newCardIndex]);
    const spinnerCard = [toColumnIndex, newCardIndex];
    this.patchServerCards(cards, spinnerCard);
  };

  // update state.cardCreateUpdate which allows for displaying / hiding cardCreateUpdate modal
  toggleCardCreateUpdateHandler = (
    active,
    columnIndex = -1,
    cardIndex = -1
  ) => {
    const cardCreateUpdate = {
      active: active,
      columnIndex: columnIndex,
      cardIndex: cardIndex
    };
    this.setState({ cardCreateUpdate: cardCreateUpdate });
  };

  // update state.columnCreateUpdate which allows for displaying / hiding columnCreateUpdate
  toggleColumnCreateUpdateHandler = (active, columnIndex = -1) => {
    const columnCreateUpdate = {
      active: active,
      columnIndex: columnIndex
    };
    this.setState({ columnCreateUpdate: columnCreateUpdate });
  };

  // show / hide spinner within a specific card
  toggleCardSpinner = (columnIndex, cardIndex) => {
    const spinner = this.state.columns[columnIndex].cards[cardIndex].spinner;
    this.setState(prevState => {
      return {
        columns: [
          ...this.state.columns.slice(0, columnIndex),
          {
            ...this.state.columns[columnIndex],
            cards: [
              ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
              {
                ...this.state.columns[columnIndex].cards[cardIndex],
                spinner: !spinner
              },
              ...this.state.columns[columnIndex].cards.slice(cardIndex + 1)
            ]
          },
          ...this.state.columns.slice(columnIndex + 1)
        ]
      };
    });
  };

  // create new column in state and call postServerColumn to create it on the server
  createColumnHandler = name => {
    this.toggleColumnCreateUpdateHandler(false);
    const columns = [...this.state.columns];
    const newColumn = {
      id: -1, // temporary id used for Column keys until id received from db
      spinner: true,
      name: name,
      position_id: this.state.columns.length,
      board_id: this.state.id,
      cards: []
    };
    columns.push(newColumn);
    this.setState({ columns: columns });
    this.postServerColumn(newColumn);
  };

  // remove card from state.
  // if: deleted card is the last card - just delete it
  // else: update position_ids of remaining cards and flag card for
  // deletion. Use patchServerCard in this case.
  deleteCardHandler = (columnIndex, cardIndex) => {
    this.toggleCardCreateUpdateHandler(false);

    // deep copy column with all of its cards
    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    for (let card in this.state.columns[columnIndex].cards) {
      column.cards[card] = { ...this.state.columns[columnIndex].cards[card] };
    }

    // was the removed card the last one in the column
    const was_last_card = true
      ? column.cards[cardIndex].position_id === column.cards.length - 1
      : false;

    // retrieve deleted card and flag for deletion
    const deletedCard = { ...column.cards[cardIndex], delete: true };

    // remove card from column
    column.cards.splice(cardIndex, 1);

    // update remaining card position ids if removed card was not the last one
    if (!was_last_card) {
      for (let key in column.cards) {
        column.cards[key]['position_id'] = parseInt(key, 10);
      }
    }

    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });

    if (!was_last_card) {
      this.patchServerCards([...column.cards, deletedCard]);
    } else {
      this.deleteServerCard(deletedCard.id);
    }
  };

  // edit existing card on the server and update local state
  editCardDetailHandler = (columnIndex, cardIndex, task) => {
    this.toggleCardCreateUpdateHandler(false);

    const card = { ...this.state.columns[columnIndex].cards[cardIndex] };
    card.task = task;

    this.setState(
      {
        columns: [
          ...this.state.columns.slice(0, columnIndex),
          {
            ...this.state.columns[columnIndex],
            cards: [
              ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
              { ...card },
              ...this.state.columns[columnIndex].cards.slice(cardIndex + 1)
            ]
          },
          ...this.state.columns.slice(columnIndex + 1)
        ]
      },
      // call back function executed after setState completes
      () => this.patchServerCardDetail(columnIndex, cardIndex)
    );
  };

  // create new card in state and call postServerCard to create it on the server
  createCardHandler = (columnIndex, task) => {
    this.toggleCardCreateUpdateHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    const new_card = {
      id: -1, // temporary id used for Card keys until id received from db
      spinner: true,
      task: task,
      column_id: column.id,
      position_id: column.cards.length
    };
    column.cards.push(new_card);

    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });

    this.postServerCard(columnIndex, new_card);
  };

  // display / hide info modal with message
  toggleInfoHandler = (message = null) => {
    this.setState({ infoModal: message });
  };

  // display / hide confirm modal. Specify function and params to be executed
  // if confirm is clicked
  toggleConfirmHandler = (message, confirmFunction, params) => {
    let confirmModal;
    if (message) {
      confirmModal = {
        message: message,
        confirmFunction: () => confirmFunction(params)
      };
    } else {
      confirmModal = {
        message: null,
        confirmFunction: null
      };
    }
    this.setState({ confirmModal: confirmModal });
  };

  render() {
    let output = <Spinner />;
    if (!this.props.retrievingData) {
      const columns = this.props.columnIds.map(columnId => {
        return <Column key={columnId} id={columnId} />;
      });
      // const columns = this.state.columns.map((column, index) => {
      //   if (column.collapsed) {
      //     return (
      //       <CollapsedColumn
      //         {...column}
      //         key={column.id}
      //         columnIndex={index}
      //         numCards={column.cards.length}
      //         toggleColumn={this.toggleColumnHandler}
      //       />
      //     );
      //   } else {
      //     return (
      //       <Column
      //         {...column}
      //         key={column.id}
      //         columnIndex={index}
      //         reorderCard={this.reorderCardHandler}
      //         moveCard={this.moveCardHandler}
      //         deleteCard={this.deleteCardHandler}
      //         toggleColumn={this.toggleColumnHandler}
      //         toggleCardCreateUpdate={this.toggleCardCreateUpdateHandler}
      //         toggleColumnCreateUpdate={this.toggleColumnCreateUpdateHandler}
      //         deleteColumn={this.deleteColumnHandler}
      //         toggleConfirm={this.toggleConfirmHandler}
      //       />
      //     );
      //   }
      // });

      // display Column modal if this.state.columnCreateUpdate.active
      let columnCreateUpdate = null;
      if (this.state.columnCreateUpdate.active) {
        const column = this.state.columns[
          this.state.columnCreateUpdate.columnIndex
        ];
        columnCreateUpdate = (
          <ColumnCreateUpdate
            {...this.state.columnCreateUpdate}
            name={column ? column.name : null}
            toggleColumnCreateUpdate={this.toggleColumnCreateUpdateHandler}
            createColumn={this.createColumnHandler}
          />
        );
      }

      // display CardCreateUpdate modal if this.state.cardCreateUpdate.active
      let cardCreateUpdate = null;
      if (this.state.cardCreateUpdate.active) {
        const card = this.state.columns[this.state.cardCreateUpdate.columnIndex]
          .cards[this.state.cardCreateUpdate.cardIndex];
        cardCreateUpdate = (
          <CardCreateUpdate
            {...this.state.cardCreateUpdate}
            task={card ? card.task : null}
            toggleCardCreateUpdate={this.toggleCardCreateUpdateHandler}
            editCardDetail={this.editCardDetailHandler}
            deleteCard={this.deleteCardHandler}
            createCard={this.createCardHandler}
          />
        );
      }

      output = (
        <BoardContainer>
          <BoardControls
            toggleColumnCreateUpdate={this.toggleColumnCreateUpdateHandler}
          />
          <ColumnsContainer>
            {columnCreateUpdate}
            {cardCreateUpdate}
            {columns}
          </ColumnsContainer>
        </BoardContainer>
      );
    }

    let infoModal = null;
    if (this.props.infoModal) {
      infoModal = (
        <Info
          message={this.props.infoModal}
          toggleInfo={this.props.toggleInfoModal}
        />
      );
    }

    // display / hide confirmation modal
    let confirmModal = null;
    if (this.state.confirmModal.message) {
      confirmModal = (
        <Confirm
          message={this.state.confirmModal.message}
          confirmFunction={this.state.confirmModal.confirmFunction}
          toggleConfirm={this.toggleConfirmHandler}
        />
      );
    }

    return (
      <Fragment>
        {infoModal}
        {confirmModal}
        {output}
      </Fragment>
    );
  }
}

Board.propTypes = propTypes;

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    id: state.home.selectedBoardId,
    columnIds: state.board.columns,
    retrievingData: state.board.retrievingData,
    infoModal: state.board.infoModal
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBoard: id => dispatch(actions.getBoard(id)),
    toggleInfoModal: message => dispatch(actions.toggleInfoModal(message))
  };
};

export const BoardComponentOnly = Board; // used for shallow unit testing
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragDropContext(HTML5Backend)(Board));
