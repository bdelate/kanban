// react imports
import React, { Component } from 'react';

// container imports
import Board from './containers/Board/Board';

// 3rd party imports
import styled from 'styled-components';

const UIContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

class App extends Component {
  render() {
    return (
      <UIContainer>
        <Board></Board>
      </UIContainer>
    );
  }
}

export default App;
