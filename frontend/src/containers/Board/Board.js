// react imports
import React, {Component} from 'react';

// project imports
import Column from '../Column/Column';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';

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
          {cardId: 0, task: 'first column first task'},
          {cardId: 1, task: 'first column second task'},
        ]
      }, {
        columnId: 1,
        title: 'second column',
        collapsed: false,
        cards: [
          {cardId: 2, task: 'second column first task'},
          {cardId: 3, task: 'second column second task'},
          {cardId: 4, task: 'second column third task'},
        ]
      }, {
        columnId: 2,
        title: 'third column',
        collapsed: true,
        cards: [
          {cardId: 5, task: 'third column first task'},
          {cardId: 6, task: 'third column second task'},
        ]
      }
    ]
  }

  // collapse / uncollapse column
  toggleColumnHandler = columnIndex => {
    const column = {...this.state.columns[columnIndex]};
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
        />
      }
    });

    return (
      <ColumnsContainer>{columns}</ColumnsContainer>
    )
  }
}

export default DragDropContext(HTML5Backend)(Board);
