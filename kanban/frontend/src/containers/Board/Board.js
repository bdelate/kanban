// react imports
import React, { Component, Fragment } from 'react';

// project imports
import Column from '../Column/Column';
import CreateColumnModal from '../../components/Modals/ColumnCreateUpdate';
import Spinner from '../../components/Spinner/Spinner';
import Confirm from '../../components/Modals/Confirm';
import Button from '../../components/UI/Button';
import { connect } from 'react-redux';
import * as actions from './actions';

// 3rd party imports
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import axios from 'axios';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
  authToken: PropTypes.string.isRequired
};

const BoardContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 10px;
  background-color: #c3d9e8;
  border-radius: 2px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {
  state = {
    confirmModal: {
      message: null,
      confirmFunction: null
    },
    createColumnModal: false
  };

  // set auth token and retrieve data on initial mount
  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = `JWT ${
      this.props.authToken
    }`;
    this.props.getBoard(this.props.id);
  }

  // called when the props change (eg: a different boardId was selected)
  static getDerivedStateFromProps(nextProps, prevState) {
    return { ...nextProps };
  }

  // if board id has changed, dispatch getBoard to retrieve data from server
  componentDidUpdate(prevProps, prevState) {
    if (prevState.id !== this.props.id) {
      this.props.getBoard(this.props.id);
    }
  }

  toggleCreateColumnModal = () => {
    this.setState({ createColumnModal: !this.state.createColumnModal });
  };

  handleCreateColumn = name => {
    const column = {
      name: name,
      id: -1,
      position_id: this.props.columnIds.length,
      board_id: this.props.id,
      cards: [],
      spinner: true
    };
    this.toggleCreateColumnModal();
    this.props.createColumn(column);
  };

  // display / hide confirm modal. Specify function and params to be executed
  // if confirm is clicked
  toggleConfirmHandler = (message, confirmFunction, params) => {
    let confirmModal;
    if (message) {
      confirmModal = {
        message: message,
        confirmFunction: () => confirmFunction(params)
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
    let output = <Spinner />;
    if (!this.props.retrievingData) {
      const columns = this.props.columnIds.map(columnId => {
        return <Column key={columnId} id={columnId} />;
      });

      let createColumnModal = null;
      if (this.state.createColumnModal) {
        createColumnModal = (
          <CreateColumnModal
            toggleModal={this.toggleCreateColumnModal}
            createColumn={name => this.handleCreateColumn(name)}
          />
        );
      }

      output = (
        <BoardContainer>
          <div>
            <Button domProps={{ onClick: this.toggleCreateColumnModal }}>
              Create Column
            </Button>
          </div>
          <ColumnsContainer>
            {createColumnModal}
            {columns}
          </ColumnsContainer>
        </BoardContainer>
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

    return (
      <Fragment>
        {confirmModal}
        {output}
      </Fragment>
    );
  }
}

Board.propTypes = propTypes;

const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    id: state.home.selectedBoardId,
    columnIds: state.board.columns,
    retrievingData: state.board.retrievingData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBoard: id => dispatch(actions.getBoard(id)),
    createColumn: column => dispatch(actions.createColumn(column))
  };
};

export const BoardComponentOnly = Board; // used for shallow unit testing
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragDropContext(HTML5Backend)(Board));
