// react imports
import React, { Component } from 'react';

// project imports
import Info from '../../components/Modals/Info';
import Board from '../Board/Board';
import Select from '../../components/UI/Select';
import Button from '../../components/UI/Button';
import BoardCreateUpdate from '../../components/Modals/BoardCreateUpdate';
import Confirm from '../../components/Modals/Confirm';

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
    boardCreateUpdate: {
      active: false,
      name: null
    },
    confirmModal: {
      message: null,
      confirmFunction: null
    },
    authToken: null,
    availableBoards: {},
    selectedBoardId: null // database board id of the selected board
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
    await axios
      .get('/api/boards/')
      .then(res => {
        this.setState({ availableBoards: res.data });
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        this.toggleInfoHandler(message);
      });
  }

  // display / hide info modal with message
  toggleInfoHandler = (message = null) => {
    this.setState({ infoModal: message });
  };

  // update state: selectedBoardId
  selectBoard = id => {
    this.setState({ selectedBoardId: parseInt(id, 10) });
  };

  // create a new board
  createBoardHandler = name => {
    this.toggleBoardCreateUpdateHandler();
    axios
      .post('/api/boards/', { name: name })
      .then(res => {
        const availableBoards = { ...this.state.availableBoards };
        availableBoards[res.data.id] = res.data.name;
        this.setState({
          availableBoards: availableBoards,
          selectedBoardId: res.data.id
        });
      })
      .catch(error => {
        const message = 'Error: Unable to create board';
        this.toggleInfoHandler(message);
      });
  };

  // change the boards name
  updateBoardHandler = name => {
    this.toggleBoardCreateUpdateHandler();
    if (name !== this.state.availableBoards[this.state.selectedBoardId]) {
      this.toggleBoardCreateUpdateHandler();
      axios
        .patch(`/api/boards/${this.state.selectedBoardId}/`, { name: name })
        .then(res => {
          const availableBoards = { ...this.state.availableBoards };
          availableBoards[this.state.selectedBoardId] = res.data.name;
          this.setState({ availableBoards: availableBoards });
        })
        .catch(error => {
          const message = 'Error: Unable to update board';
          this.toggleInfoHandler(message);
        });
    }
  };

  // delete board
  deleteBoardHandler = () => {
    this.toggleConfirmHandler();
    axios
      .delete(`/api/boards/${this.state.selectedBoardId}/`)
      .then(res => {
        const availableBoards = { ...this.state.availableBoards };
        delete availableBoards[this.state.selectedBoardId];
        this.setState({
          availableBoards: availableBoards,
          selectedBoardId: null
        });
      })
      .catch(error => {
        const message = 'Error: Unable to delete board';
        this.toggleInfoHandler(message);
      });
  };

  // logout user by deleting localStorage authToken and redirect to /auth
  logout = () => {
    localStorage.removeItem('authToken');
    this.props.history.push('/auth');
  };

  // Display / hide boardCreateUpdate modal
  toggleBoardCreateUpdateHandler = update => {
    const name = update
      ? this.state.availableBoards[this.state.selectedBoardId]
      : null;

    const boardCreateUpdate = {
      active: !this.state.boardCreateUpdate.active,
      name: name
    };

    this.setState({ boardCreateUpdate: boardCreateUpdate });
  };

  // display / hide confirm modal. Specify function to be executed
  // if confirm is clicked
  toggleConfirmHandler = (message, confirmFunction) => {
    let confirmModal;
    if (message) {
      confirmModal = {
        message: message,
        confirmFunction: () => confirmFunction()
      };
    } else {
      confirmModal = {
        message: null,
        confirmFunction: null
      };
    }
    this.setState({ confirmModal: confirmModal });
  };

  render() {
    let infoModal = null;
    if (this.state.infoModal) {
      infoModal = (
        <Info
          message={this.state.infoModal}
          toggleInfo={this.toggleInfoHandler}
        />
      );
    }

    let confirmModal = null;
    if (this.state.confirmModal.message) {
      confirmModal = (
        <Confirm
          message={this.state.confirmModal.message}
          confirmFunction={this.state.confirmModal.confirmFunction}
          toggleConfirm={this.toggleConfirmHandler}
        />
      );
    }

    // display modal if this.state.boardCreateUpdate.active == true
    let boardCreateUpdate = null;
    if (this.state.boardCreateUpdate.active) {
      boardCreateUpdate = (
        <BoardCreateUpdate
          name={this.state.boardCreateUpdate.name}
          toggleBoardCreateUpdate={this.toggleBoardCreateUpdateHandler}
          createBoard={this.createBoardHandler}
          updateBoard={this.updateBoardHandler}
        />
      );
    }

    const board =
      this.state.authToken && this.state.selectedBoardId ? (
        <Board
          authToken={this.state.authToken}
          id={this.state.selectedBoardId}
        />
      ) : null;

    const createBoardButton = (
      <Button clicked={this.toggleBoardCreateUpdateHandler}>
        Create Board
      </Button>
    );

    let editBoardButton = null;
    if (this.state.selectedBoardId) {
      editBoardButton = (
        <Button clicked={() => this.toggleBoardCreateUpdateHandler(true)}>
          Edit Board Name
        </Button>
      );
    }

    const logoutButton = <Button clicked={this.logout}>Logout</Button>;

    let deleteBoardButton = null;
    if (this.state.selectedBoardId) {
      deleteBoardButton = (
        <Button
          clicked={() =>
            this.toggleConfirmHandler(
              'Board and all content will be deleted',
              this.deleteBoardHandler
            )
          }
        >
          Delete Board
        </Button>
      );
    }

    return (
      <HomeContainer>
        {infoModal}
        {confirmModal}
        {boardCreateUpdate}
        <Select
          onChangeFunc={this.selectBoard}
          options={this.state.availableBoards}
          selectedValue={this.state.selectedBoardId || -1}
        />
        <div>
          {createBoardButton}
          {editBoardButton}
          {deleteBoardButton}
          {logoutButton}
        </div>
        {board}
      </HomeContainer>
    );
  }
}

export default Home;
