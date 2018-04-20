// react imports
import React, {Component} from 'react';

// component imports
import Column from '../../components/Column/Column';

// 3rd party imports
import styled from 'styled-components';


const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {

  state = {
    columns: [{
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
        {cardId: 0, task: 'second column first task'},
        {cardId: 1, task: 'second column second task'},
        {cardId: 2, task: 'second column third task'},
      ]
    }, {
      columnId: 2,
      title: 'third column',
      cards: [
        {cardId: 0, task: 'third column first task'},
        {cardId: 1, task: 'third column second task'},
      ]
    }]
  }

  render() {
    const columns = this.state.columns.map(column => (
      <Column
        key={column.columnId}
        id={column.columnId}
        title={column.title}
        cards={column.cards}
      />
    ));

    return(
      <ColumnsContainer>{columns}</ColumnsContainer>
    )
  }
}

export default Board;
