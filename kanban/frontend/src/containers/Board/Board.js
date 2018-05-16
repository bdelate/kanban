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

  componentDidMount() {
    this.retrieveData();
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

  // reorder cards within the same column
  reorderCardHandler = (fromColumnIndex, fromCardIndex, toCardIndex) => {
    const fromColumn = { ...this.state.columns[fromColumnIndex] };
    fromColumn.cards = [...this.state.columns[fromColumnIndex].cards];
    const card = fromColumn.cards.splice(fromCardIndex, 1)[0];
    fromColumn.cards.splice(toCardIndex, 0, card);
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

    // remove card from fromColumnIndex and push to toColumnIndex
    const card = updatedState.columns[
      fromColumnIndex
    ].cards.splice(fromCardIndex, 1)[0];
    updatedState.columns[toColumnIndex].cards.push(card);
    this.setState(updatedState);
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

  displayCardSpinner = (column, columnIndex, cardIndex) => {
    column.cards[cardIndex].spinner = true;
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  }

  // delete card on server and remove it from local state
  deleteCardHandler = (columnIndex, cardIndex) => {
    this.toggleCardCrudHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    column.cards[cardIndex] = { ...column.cards[cardIndex] };
    this.displayCardSpinner(column, columnIndex, cardIndex);

    // TODO: ajax to server

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

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    column.cards[cardIndex] = { ...column.cards[cardIndex] };
    this.displayCardSpinner(column, columnIndex, cardIndex);

    // TODO: ajax to server

    column.cards[cardIndex].spinner = false;
    column.cards[cardIndex].task = task;
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
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
