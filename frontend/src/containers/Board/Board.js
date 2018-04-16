// react imports
import React, {Component} from 'react';

// components
import Column from '../../components/Column/Column';

// 3rd party imports
import styled from 'styled-components';


const ColumnContainer = styled.div`
  display: flex;
`;

class Board extends Component {

    state = {
      columns: [{
          columnId: 0,
          title: 'first column',
          cards: [
            {id: 0, task: 'first column first task'},
            {id: 1, task: 'first column second task'},
          ]
        }, {
          columnId: 1,
          title: 'second column',
          cards: [
            {id: 0, task: 'second column first task'},
            {id: 1, task: 'second column second task'},
          ]
        }, {
          columnId: 2,
          title: 'third column',
          cards: [
            {id: 0, task: 'third column first task'},
            {id: 1, task: 'third column second task'},
          ]
        }
      ]
    }

    render() {
      const columns = this.state.columns.map(column => (
        <Column
          key={column.columnId}
          id={column.columnId}
          title={column.title} />
      ));

      return(
        <ColumnContainer>{columns}</ColumnContainer>
      )
    }
}

export default Board;
