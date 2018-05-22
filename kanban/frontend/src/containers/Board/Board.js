// react imports
import React, { Component, Fragment } from 'react';

// project imports
import Column from '../Column/Column';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';
import CardCrud from '../../components/CardCrud/CardCrud';
import Spinner from '../../components/Spinner/Spinner';
import Modal from '../../components/Modal/Modal';

// 3rd party imports
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import axios from 'axios';


const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {

  state = {
    retrieving_data: true,
    modal: false,
    cardCrud: {
      active: false,
      columnIndex: -1,
      cardIndex: -1
    },
    columns: []
  }

  componentDidMount() {
    this.retrieveData();
  }

  // retrieve all board data from the server
  async retrieveData() {
    await axios.get('/api/boards/2/')
      .then(res => {
        this.setState({
          ...this.state,
          retrieving_data: false,
          columns: res.data.columns
        });
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        this.displayModal(message)
      })
  }

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

  // update all cards in ColumnIndex on the server
  // optionally display a spinner for a specific card in the column
  updateServerCardsHandler = (columnIndex, cardIndex = -1) => {
    if (cardIndex > -1) this.toggleCardSpinner(columnIndex, cardIndex);
    const cards = [...this.state.columns[columnIndex].cards];
    axios.patch(`/api/cards/`, {
      cards
    }).then(res => {
      if (cardIndex > -1) this.toggleCardSpinner(columnIndex, cardIndex);
    }).catch(error => {
      if (cardIndex > -1) this.toggleCardSpinner(columnIndex, cardIndex);
      const message = 'Error: Unable to update cards on the server';
      this.displayModal(message)
    })
  };

  // reorder cards within the same column (local state update only)
  reorderCardHandler = (fromColumnIndex, fromCardIndex, toCardIndex) => {
    const fromColumn = { ...this.state.columns[fromColumnIndex] };
    fromColumn.cards = [...this.state.columns[fromColumnIndex].cards];
    const card = fromColumn.cards.splice(fromCardIndex, 1)[0];
    fromColumn.cards.splice(toCardIndex, 0, card);

    // update position_ids
    for (let key in fromColumn.cards) {
      fromColumn.cards[key]['position_id'] = parseInt(key, 10);
    }

    this.setState({
      columns: [
        ...this.state.columns.slice(0, fromColumnIndex),
        fromColumn,
        ...this.state.columns.slice(fromColumnIndex + 1)
      ]
    });
  };

  // move card to a different column
  moveCardHandler = (fromColumnIndex, fromCardIndex, toColumnIndex) => {
    // make deep copy of entire state
    const updatedState = { ...this.state };
    for (let column in this.state.columns) {
      updatedState.columns[column] = { ...this.state.columns[column] }
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
    const card = updatedState.columns[
      fromColumnIndex
    ].cards.splice(fromCardIndex, 1)[0];

    // update card.column_id
    card.column_id = updatedState.columns[toColumnIndex].id;

    // push card to toColumnIndex
    updatedState.columns[toColumnIndex].cards.push(card);

    // update card position ids in fromColumnIndex and toColumnIndex columns
    for (let key in updatedState.columns[fromColumnIndex].cards) {
      updatedState.columns[fromColumnIndex].cards[key]['position_id'] = parseInt(key, 10);
    }
    for (let key in updatedState.columns[toColumnIndex].cards) {
      updatedState.columns[toColumnIndex].cards[key]['position_id'] = parseInt(key, 10);
    }

    // update state
    this.setState(updatedState);

    // update the server
    this.updateServerCardsHandler(fromColumnIndex);
    this.updateServerCardsHandler(toColumnIndex, card.position_id);
  };

  // update state.cardCrud which allows for displaying / hiding cardCrud modal
  toggleCardCrudHandler = (active, columnIndex = -1, cardIndex = -1) => {
    const cardCrud = {
      active: active,
      columnIndex: columnIndex,
      cardIndex: cardIndex
    }
    this.setState({ cardCrud: cardCrud });
  }

  // show / hide spinner within a specific card
  toggleCardSpinner = (columnIndex, cardIndex) => {
    const spinner = this.state.columns[columnIndex].cards[cardIndex].spinner;
    this.setState((prevState) => {
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
      }
    });
  }

  // delete card on server and remove it from local state
  deleteCardHandler = (columnIndex, cardIndex) => {
    this.toggleCardCrudHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    column.cards[cardIndex] = { ...column.cards[cardIndex] };
    this.toggleCardSpinner(columnIndex, cardIndex);

    // TODO: ajax to server

    this.toggleCardSpinner(columnIndex, cardIndex);
    column.cards.splice(cardIndex, 1);
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  }

  // edit existing card on the server and update local state
  editCardHandler = (columnIndex, cardIndex, task) => {
    this.toggleCardCrudHandler(false);

    // create column/card object from state and display spinner in card
    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    column.cards[cardIndex] = { ...column.cards[cardIndex] };
    this.toggleCardSpinner(columnIndex, cardIndex);

    // update card on server and in state, or display error modal
    const cardId = column.cards[cardIndex].id;
    axios.patch(`/api/cards/${cardId}/`, { id: cardId, task: task })
      .then(res => {
        column.cards[cardIndex] = res.data
        this.setState({
          columns: [
            ...this.state.columns.slice(0, columnIndex),
            column,
            ...this.state.columns.slice(columnIndex + 1)
          ]
        });
      })
      .catch(error => {
        // TODO: write test to ensure spinner no longer displays when error is received
        this.toggleCardSpinner(columnIndex, cardIndex);
        const message = 'Error: Unable to save task';
        this.displayModal(message)
      })
  }

  // create card on the server and add new card to local state
  createCardHandler = (columnIndex, task) => {
    this.toggleCardCrudHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    column.cards.push({
      id: -1,
      spinner: true
    });

    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });

    // TODO: ajax to server

    column.cards[column.cards.length - 1].spinner = false;
    column.cards[column.cards.length - 1].task = task;
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  }

  displayModal(message) {
    this.setState({
      retrieving_data: false,
      modal: message
    });
  }

  // close the modal by setting its state to false
  closeModalHandler = () => {
    this.setState({
      modal: false
    });
  }

  render() {
    let output = <Spinner />;
    if (!this.state.retrieving_data) {
      const columns = this.state.columns.map((column, index) => {
        if (column.collapsed) {
          return <CollapsedColumn
            key={column.id}
            columnIndex={index}
            name={column.name}
            numCards={column.cards.length}
            toggleColumn={this.toggleColumnHandler}
          />
        } else {
          return <Column
            key={column.id}
            columnIndex={index}
            name={column.name}
            cards={column.cards}
            reorderCard={this.reorderCardHandler}
            moveCard={this.moveCardHandler}
            updateServerCards={this.updateServerCardsHandler}
            toggleColumn={this.toggleColumnHandler}
            toggleCardCrud={this.toggleCardCrudHandler}
          />
        }
      });

      // display CardCrud modal if this.state.cardCrud.active
      let cardCrud = null;
      if (this.state.cardCrud.active) {
        const card = this.state.columns[
          this.state.cardCrud.columnIndex]
          .cards[this.state.cardCrud.cardIndex];
        cardCrud = <CardCrud
          {...this.state.cardCrud}
          task={card ? card.task : null}
          toggleCardCrud={this.toggleCardCrudHandler}
          editCard={this.editCardHandler}
          deleteCard={this.deleteCardHandler}
          createCard={this.createCardHandler}
        />
      }

      output = (
        <ColumnsContainer>
          {cardCrud}
          {columns}
        </ColumnsContainer>
      )
    }

    let modal = null;
    if (this.state.modal) {
      modal = <Modal
        message={this.state.modal}
        closeModal={this.closeModalHandler} />
    }

    return (
      <Fragment>
        {modal}
        {output}
      </Fragment>
    )
  }
}

export const BoardComponentOnly = Board; // used for shallow unit testing
export default DragDropContext(HTML5Backend)(Board);
