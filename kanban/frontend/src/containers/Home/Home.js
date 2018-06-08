// react imports
import React, { Component } from 'react';

// project imports
import Info from '../../components/Modals/Info';
import Board from '../Board/Board';

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
    board_id: 2  // board_id of the selected board
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
        console.log(res.data);
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

  render() {
    let infoModal = null;
    if (this.state.infoModal) {
      infoModal = <Info
        message={this.state.infoModal}
        toggleInfo={this.toggleInfoHandler} />
    }

    const board = (this.state.authToken && this.state.board_id)
      ? <Board authToken={this.state.authToken} id={this.state.board_id} />
      : null;

    return (
      <HomeContainer>
        {infoModal}
        test
        {board}
      </HomeContainer>
    );
  }
}

export default Home;