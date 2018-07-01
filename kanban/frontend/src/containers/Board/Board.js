// react imports
import React, { Component, Fragment } from 'react';

// project imports
import Column from '../Column/Column';
import CreateColumnModal from '../../components/Modals/ColumnCreateUpdate';
import Spinner from '../../components/Spinner/Spinner';
import Info from '../../components/Modals/Info';
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
    createColumnModal: false,
    previousState: {}
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

  // make a deep copy of the entire state and save it to state.previousState
  savePreviousState = () => {
    const currentState = { ...this.state };
    for (let column in this.state.columns) {
      currentState.columns[column] = { ...this.state.columns[column] };
      currentState.columns[column].cards = [
        ...this.state.columns[column].cards
      ];
      for (let card in this.state.columns[column].cards) {
        currentState.columns[column].cards[card] = {
          ...this.state.columns[column].cards[card]
        };
      }
    }
    delete currentState.previousState;
    this.setState({ previousState: currentState });
  };

  // move card to a different column
  moveCardHandler = (fromColumnIndex, fromCardIndex, toColumnIndex) => {
    // create deep copy of all columns
    const updatedState = { columns: [...this.state.columns] };
    for (let column in updatedState.columns) {
      updatedState.columns[column] = { ...this.state.columns[column] };
      updatedState.columns[column].cards = [
        ...this.state.columns[column].cards
      ];
      for (let card in this.state.columns[column].cards) {
        updatedState.columns[column].cards[card] = {
          ...this.state.columns[column].cards[card]
        };
      }
    }

    // remove card from fromColumnIndex
    const card = updatedState.columns[fromColumnIndex].cards.splice(
      fromCardIndex,
      1
    )[0];

    // update card column_id and position_id
    card.column_id = updatedState.columns[toColumnIndex].id;
    card.position_id = updatedState.columns[toColumnIndex].cards.length;

    // push card to toColumnIndex
    updatedState.columns[toColumnIndex].cards.push(card);

    // update card position ids in fromColumnIndex
    for (let key in updatedState.columns[fromColumnIndex].cards) {
      updatedState.columns[fromColumnIndex].cards[key][
        'position_id'
      ] = parseInt(key, 10);
    }

    // update state
    this.setState({ columns: updatedState.columns });

    // update server with changed cards, ie: moved card and cards in fromColumn
    const newCardIndex = updatedState.columns[toColumnIndex].cards.length - 1;
    const cards = [...updatedState.columns[fromColumnIndex].cards];
    cards.push(updatedState.columns[toColumnIndex].cards[newCardIndex]);
    const spinnerCard = [toColumnIndex, newCardIndex];
    this.patchServerCards(cards, spinnerCard);
  };

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

    return (
      <Fragment>
        {infoModal}
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
    retrievingData: state.board.retrievingData,
    infoModal: state.board.infoModal
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBoard: id => dispatch(actions.getBoard(id)),
    toggleInfoModal: message => dispatch(actions.toggleInfoModal(message)),
    createColumn: column => dispatch(actions.createColumn(column))
  };
};

export const BoardComponentOnly = Board; // used for shallow unit testing
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragDropContext(HTML5Backend)(Board));
