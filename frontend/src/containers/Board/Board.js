// react imports
import React, { Component } from 'react';

// project imports
import Column from '../Column/Column';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';
import CardCrud from '../../components/CardCrud/CardCrud';

// 3rd party imports
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {

  state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        collapsed: false,
        cards: [
          { cardId: 0, task: 'first column first task' },
          { cardId: 1, task: 'first column second task' },
        ]
      }, {
        columnId: 1,
        title: 'second column',
        collapsed: false,
        cards: [
          { cardId: 2, task: 'second column first task' },
          { cardId: 3, task: 'second column second task' },
          { cardId: 4, task: 'second column third task' },
        ]
      }, {
        columnId: 2,
        title: 'third column',
        collapsed: true,
        cards: [
          { cardId: 5, task: 'third column first task' },
          { cardId: 6, task: 'third column second task' },
        ]
      }
    ],
    cardCrud: {
      active: false,
      columnIndex: -1,
      cardIndex: -1
    }
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
      cardId: -1,
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

  render() {
    const columns = this.state.columns.map((column, index) => {
      if (column.collapsed) {
        return <CollapsedColumn
          key={column.columnId}
          columnIndex={index}
          title={column.title}
          numCards={column.cards.length}
          toggleColumn={this.toggleColumnHandler}
        />
      } else {
        return <Column
          key={column.columnId}
          columnIndex={index}
          title={column.title}
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

    return (
      <ColumnsContainer>
        {cardCrud}
        {columns}
      </ColumnsContainer>
    )
  }
}

export const BoardComponentOnly = Board; // used for shallow unit testing
export default DragDropContext(HTML5Backend)(Board);
