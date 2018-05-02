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

  // rearrange cards within the same column
  rearrangeCardHandler = (fromColumnIndex, fromCardIndex, toCardIndex) => {
    const fromColumn = {...this.state.columns[fromColumnIndex]};
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
    const updatedState = {...this.state};
    for (let column in this.state.columns) {
      updatedState.columns[column] = {...this.state.columns[column]}
      updatedState.columns[column].cards = [...this.state.columns[column].cards];
      for (let card in this.state.columns[column].cards) {
        updatedState.columns[column].cards[card] = {...this.state.columns[column].cards[card]}
      }
    }

    const card = updatedState.columns[fromColumnIndex].cards.splice(fromCardIndex, 1)[0];
    updatedState.columns[toColumnIndex].cards.push(card);
    this.setState(updatedState);
  };

  render() {
    const columns = this.state.columns.map((column, index) => (
      <Column
        key={column.columnId}
        columnIndex={index}
        title={column.title}
        cards={column.cards}
        rearrangeCard={this.rearrangeCardHandler}
        moveCard={this.moveCardHandler}
      />
    ));

    return(
      <ColumnsContainer>{columns}</ColumnsContainer>
    )
  }
}

export default DragDropContext(HTML5Backend)(Board);
