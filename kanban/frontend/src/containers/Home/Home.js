// react imports
import React, { Component } from 'react';

// project imports
import Info from '../../components/Modals/Info';
import Board from '../Board/Board';
import Select from '../../components/UI/Select';

// 3rd party imports
import styled from 'styled-components';
import jwtDecode from 'jwt-decode';
import axios from 'axios';


const HomeContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: green;
`;

class Home extends Component {

  state = {
    infoModal: false,
    authToken: null,
    availableBoards: {},
    selectedBoardId: null  // database board id of the selected board
  };

  componentDidMount() {
    if (this.isLoggedIn()) this.retrieveData();
    else this.props.history.push('/auth');
  }

  // if authToken exists and has not expired, user is considered logged in
  isLoggedIn() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      if (new Date() <= new Date(decodedToken.exp * 1000)) {
        axios.defaults.headers.common['Authorization'] = `JWT ${authToken}`;
        this.setState({ authToken: authToken });
        return true;
      }
    }
    return false;
  }

  // retrieve available user boards from the server
  async retrieveData() {
    await axios.get('/api/boards/')
      .then(res => {
        this.setState({ availableBoards: res.data });
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        this.toggleInfoHandler(message)
      })
  }

  // display / hide info modal with message
  toggleInfoHandler = (message = null) => {
    this.setState({ infoModal: message });
  };

  loadBoard = (id) => {
    this.setState({ selectedBoardId: parseInt(id, 10) });
  }

  render() {
    let infoModal = null;
    if (this.state.infoModal) {
      infoModal = <Info
        message={this.state.infoModal}
        toggleInfo={this.toggleInfoHandler} />
    }

    const board = (this.state.authToken && this.state.selectedBoardId)
      ? <Board authToken={this.state.authToken} id={this.state.selectedBoardId} />
      : null;

    return (
      <HomeContainer>
        {infoModal}
        <Select
          onChangeFunc={this.loadBoard}
          options={this.state.availableBoards}
        />
        {board}
      </HomeContainer>
    );
  }
}

export default Home;