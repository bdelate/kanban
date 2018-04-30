// react imports
import React, {Component} from 'react';

// component imports
import Column from '../../components/Column/Column';

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
        cards: [
          {cardId: 0, task: 'first column first task'},
          {cardId: 1, task: 'first column second task'},
        ]
      }, {
        columnId: 1,
        title: 'second column',
        cards: [
          {cardId: 2, task: 'second column first task'},
          {cardId: 3, task: 'second column second task'},
          {cardId: 4, task: 'second column third task'},
        ]
      }, {
        columnId: 2,
        title: 'third column',
        cards: [
          {cardId: 5, task: 'third column first task'},
          {cardId: 6, task: 'third column second task'},
        ]
      }
    ]
  }

  appendCard = (card, columnIndex) => {
    const updatedToColumn = {...this.state.columns[columnIndex]};
    updatedToColumn.cards = [...this.state.columns[columnIndex].cards];
    updatedToColumn.cards.push(card);
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        updatedToColumn,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  };

  removeCard = (columnIndex, cardIndex) => {
    const updatedFromColumn = {...this.state.columns[columnIndex]};
    updatedFromColumn.cards = [...this.state.columns[columnIndex].cards];
    updatedFromColumn.cards.splice(cardIndex, 1);
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        updatedFromColumn,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  };

  moveCardHandler = (fromColumnIndex, fromCardIndex, toColumnIndex) => {
    const card = {...this.state.columns[fromColumnIndex].cards[fromCardIndex]};
    this.appendCard(card, toColumnIndex);
    this.removeCard(fromColumnIndex, fromCardIndex);
  };

  render() {
    const columns = this.state.columns.map((column, index) => (
      <Column
        key={column.columnId}
        columnIndex={index}
        title={column.title}
        cards={column.cards}
        moveCard={this.moveCardHandler}
      />
    ));

    return(
      <ColumnsContainer>{columns}</ColumnsContainer>
    )
  }
}

export default DragDropContext(HTML5Backend)(Board);
