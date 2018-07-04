// react imports
import React, { Component } from 'react';

// project imports
import Info from '../../components/Modals/Info';
import Board from '../Board/Board';
import Select from '../../components/UI/Select';
import Button from '../../components/UI/Button';
import BoardCreateUpdate from '../../components/Modals/BoardCreateUpdate';
import Confirm from '../../components/Modals/Confirm';
import { connect } from 'react-redux';
import * as actions from './actions';
import * as authActions from '../Auth/actions';

// 3rd party imports
import styled from 'styled-components';
import axios from 'axios';

const HomeContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

class Home extends Component {
  state = {
    boardCreateUpdateModal: {
      active: false,
      name: null
    },
    confirmModal: {
      message: null,
      confirmFunction: null
    }
  };

  componentDidMount() {
    if (this.props.authToken) {
      axios.defaults.headers.common['Authorization'] = `JWT ${
        this.props.authToken
      }`;
      this.props.getAvailableBoards();
    } else {
      this.props.history.push('/auth');
    }
  }

  // create a new board
  createBoardHandler = name => {
    this.toggleBoardCreateUpdateHandler();
    this.props.createBoard(name);
  };

  // change the boards name
  renameBoardHandler = name => {
    this.toggleBoardCreateUpdateHandler();
    if (name !== this.props.availableBoards[this.props.selectedBoardId]) {
      this.props.renameBoard(this.props.selectedBoardId, name);
    }
  };

  // delete board
  deleteBoardHandler = async () => {
    this.toggleConfirmHandler();
    this.props.deleteBoard(this.props.selectedBoardId);
  };

  // logout user
  logout = () => {
    localStorage.removeItem('authToken');
    this.props.logout();
    this.props.history.push('/auth');
  };

  // Display / hide boardCreateUpdate modal
  toggleBoardCreateUpdateHandler = update => {
    const name = update
      ? this.props.availableBoards[this.props.selectedBoardId]
      : null;

    const boardCreateUpdateModal = {
      active: !this.state.boardCreateUpdateModal.active,
      name: name
    };

    this.setState({ boardCreateUpdateModal: boardCreateUpdateModal });
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
    // display / hide info modal
    let infoModal = null;
    if (this.props.infoModal) {
      infoModal = (
        <Info
          message={this.props.infoModal}
          toggleInfo={this.props.toggleInfoModal}
        />
      );
    }

    // display / hide confirmation modal
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

    // display / hide board create/update modal
    let boardCreateUpdate = null;
    if (this.state.boardCreateUpdateModal.active) {
      boardCreateUpdate = (
        <BoardCreateUpdate
          name={this.state.boardCreateUpdateModal.name}
          toggleBoardCreateUpdate={this.toggleBoardCreateUpdateHandler}
          createBoard={this.createBoardHandler}
          renameBoard={this.renameBoardHandler}
        />
      );
    }

    // dropdown containing the available boards
    const boardSelection = (
      <Select
        onChangeFunc={this.props.selectBoard}
        options={this.props.availableBoards}
        selectedValue={this.props.selectedBoardId || -1}
      />
    );

    const createBoardButton = (
      <Button
        domProps={{
          onClick: () => this.toggleBoardCreateUpdateHandler(false)
        }}
      >
        Create Board
      </Button>
    );

    const logoutButton = (
      <Button domProps={{ onClick: this.logout }}>Logout</Button>
    );

    // display board and edit/delete buttons if a board has been selected
    let board = null;
    let editBoardButton = null;
    let deleteBoardButton = null;
    if (this.props.selectedBoardId) {
      board = <Board />;

      editBoardButton = (
        <Button
          domProps={{
            onClick: () => this.toggleBoardCreateUpdateHandler(true)
          }}
        >
          Edit Board Name
        </Button>
      );

      deleteBoardButton = (
        <Button
          domProps={{
            onClick: () =>
              this.toggleConfirmHandler(
                'Board and all content will be deleted',
                this.deleteBoardHandler
              )
          }}
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
        <div>
          {boardSelection}
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

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    selectedBoardId: state.home.selectedBoardId,
    availableBoards: state.home.availableBoards,
    infoModal: state.home.infoModal
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectBoard: id => dispatch(actions.selectBoard(id)),
    createBoard: name => dispatch(actions.createBoard(name)),
    renameBoard: (id, name) => dispatch(actions.renameBoard(id, name)),
    deleteBoard: id => dispatch(actions.deleteBoard(id)),
    getAvailableBoards: () => dispatch(actions.getAvailableBoards()),
    toggleInfoModal: message => dispatch(actions.toggleInfoModal(message)),
    logout: () => dispatch(authActions.logout())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
