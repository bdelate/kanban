// react imports
import React, { Component } from 'react';

// container imports
import Board from './containers/Board/Board';

// 3rd party imports
import styled from 'styled-components';

import './App.css';

const BoardContainer = styled.div`
  color: red;
`;

class App extends Component {
  render() {
    return (
      <BoardContainer>
        <Board></Board>
      </BoardContainer>
    );
  }
}

export default App;
