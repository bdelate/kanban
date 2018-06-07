// react imports
import React, { Component } from 'react';

// project imports
import Board from './containers/Board/Board';
import Auth from './components/Auth/Auth';

// 3rd party imports
import styled from 'styled-components';
import { Route, Switch } from 'react-router-dom';

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
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/" exact component={Board} />
        </Switch>
      </UIContainer>
    );
  }
}

export default App;
