// react imports
import React, { Component, Fragment } from 'react';

// project imports
import Column from '../Column/Column';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';
import ColumnModal from '../../components/ColumnCreateUpdate/ColumnCreateUpdate';
import CardCrud from '../../components/CardCrud/CardCrud';
import Spinner from '../../components/Spinner/Spinner';
import Modal from '../../components/Modal/Modal';
import BoardControls from '../../containers/BoardControls/BoardControls';

// 3rd party imports
import styled from 'styled-components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import axios from 'axios';


const BoardContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: yellow;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex: 1;
`;

class Board extends Component {

  state = {
    retrieving_data: true,
    modal: false,
    columnModal: {
      active: false,
      columnIndex: -1
    },
    cardCrud: {
      active: false,
      columnIndex: -1,
      cardIndex: -1
    },
    columns: [],
    previousState: {}
  }

  componentDidMount() {
    this.retrieveData();
  }

  // retrieve all board data from the server
  async retrieveData() {
    await axios.get('/api/boards/2/')
      .then(res => {
        this.setState({
          ...res.data,
          ...this.state,
          retrieving_data: false,
          columns: res.data.columns
        }, this.savePreviousState);
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        this.setState({ retrieveData: false });
        this.toggleModalHandler(message)
      })
  }

  // make a deep copy of the entire state and save it to state.previousState
  savePreviousState = () => {
    const currentState = { ...this.state };
    for (let column in this.state.columns) {
      currentState.columns[column] = { ...this.state.columns[column] }
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

  // collapse / uncollapse column
  toggleColumnHandler = columnIndex => {
    const column = { ...this.state.columns[columnIndex] };
    column.collapsed = !column.collapsed;
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });
  };

  // update all specified cards.
  // optionally display a card spinner if a spinnerCard is provided
  patchServerCards = (cards, spinnerCard) => {
    if (spinnerCard) this.toggleCardSpinner(spinnerCard[0], spinnerCard[1]);
    axios.patch(`/api/cards/`, { cards })
      .then(res => {
        if (spinnerCard) this.toggleCardSpinner(spinnerCard[0], spinnerCard[1]);
        this.savePreviousState();
      })
      //restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update cards on the server';
        this.toggleModalHandler(message)
      })
  };

  // create new column on the server. Replace last column with response
  // to get db id and hide spinner
  postServerColumn = (column) => {
    axios.post(`/api/columns/`, column)
      .then(res => {
        this.setState({
          ...this.state,
          columns: [
            ...this.state.columns.slice(0, res.data.position_id),
            { ...res.data }
          ]
        }, this.savePreviousState);
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to create column on the server';
        this.toggleModalHandler(message)
      })
  }

  // Update column detail on the server
  patchServerColumnName = (columnIndex) => {
    const data = {
      id: this.state.columns[columnIndex].id,
      name: this.state.columns[columnIndex].name
    };
    axios.patch(`/api/columns/${data.id}/`, { ...data })
      .then(res => {
        this.setState({
          columns: [
            ...this.state.columns.slice(0, columnIndex),
            { ...res.data },
            ...this.state.columns.slice(columnIndex + 1)
          ]
        }, this.savePreviousState)
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update column on the server';
        this.toggleModalHandler(message);
      })
  };

  // Update single card detail on the server
  patchServerCardDetail = (columnIndex, cardIndex) => {
    this.toggleCardSpinner(columnIndex, cardIndex);
    const card = { ...this.state.columns[columnIndex].cards[cardIndex] };
    axios.patch(`/api/cards/${card.id}/`, { ...card })
      .then(res => {
        this.toggleCardSpinner(columnIndex, cardIndex);
        this.savePreviousState();
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to update card on the server';
        this.toggleModalHandler(message);
      })
  };

  // create new card on the server, update state with response (to get db id)
  postServerCard = (columnIndex, card) => {
    axios.post(`/api/cards/`, card)
      .then(res => {
        const cardIndex = this.state.columns[columnIndex].cards.length - 1;
        this.setState({
          ...this.state,
          columns: [
            ...this.state.columns.slice(0, columnIndex),
            {
              ...this.state.columns[columnIndex],
              cards: [
                ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
                { ...res.data }
              ]
            },
            ...this.state.columns.slice(columnIndex + 1)
          ]
        }, this.savePreviousState);
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to create card on the server';
        this.toggleModalHandler(message)
      })
  };

  // delete card on the server
  deleteServerCard = (cardId) => {
    axios.delete(`/api/cards/${cardId}/`)
      .then(res => {
        this.savePreviousState();
      })
      // restore previous valid state and display error message
      .catch(error => {
        const previousState = this.state.previousState;
        this.setState(previousState);
        const message = 'Error: Unable to delete card on the server';
        this.toggleModalHandler(message);
      })
  };

  // reorder cards within a column
  reorderCardHandler = ({ hasDropped, columnIndex, fromCardIndex, toCardIndex }) => {
    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    // card has been dropped, update column on the server
    if (hasDropped) {
      const spinnerCard = [columnIndex, toCardIndex];
      this.patchServerCards(column.cards, spinnerCard);
      // card hasn't been dropped yet, update local column state only
    } else {
      // reorder card
      const card = column.cards.splice(fromCardIndex, 1)[0];
      column.cards.splice(toCardIndex, 0, card);

      // update position_ids
      for (let key in column.cards) {
        column.cards[key]['position_id'] = parseInt(key, 10);
      }

      this.setState({
        columns: [
          ...this.state.columns.slice(0, columnIndex),
          column,
          ...this.state.columns.slice(columnIndex + 1)
        ]
      });
    }
  };

  // move card to a different column
  moveCardHandler = (fromColumnIndex, fromCardIndex, toColumnIndex) => {
    // create deep copy of all columns
    const updatedState = { columns: [...this.state.columns] };
    for (let column in updatedState.columns) {
      updatedState.columns[column] = { ...this.state.columns[column] }
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
    const card = updatedState.columns[
      fromColumnIndex
    ].cards.splice(fromCardIndex, 1)[0];

    // update card.column_id
    card.column_id = updatedState.columns[toColumnIndex].id;

    // push card to toColumnIndex
    updatedState.columns[toColumnIndex].cards.push(card);

    // update card position ids in fromColumnIndex and toColumnIndex columns
    for (let key in updatedState.columns[fromColumnIndex].cards) {
      updatedState.columns[fromColumnIndex].cards[key]['position_id'] = parseInt(key, 10);
    }
    for (let key in updatedState.columns[toColumnIndex].cards) {
      updatedState.columns[toColumnIndex].cards[key]['position_id'] = parseInt(key, 10);
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

  // update state.cardCrud which allows for displaying / hiding cardCrud modal
  toggleCardCrudHandler = (active, columnIndex = -1, cardIndex = -1) => {
    const cardCrud = {
      active: active,
      columnIndex: columnIndex,
      cardIndex: cardIndex
    }
    this.setState({ cardCrud: cardCrud });
  };

  // update state.columnModal which allows for displaying / hiding columnModal
  toggleColumnModalHandler = (active, columnIndex = -1) => {
    const columnModal = {
      active: active,
      columnIndex: columnIndex
    };
    this.setState({ columnModal: columnModal });
  };

  // show / hide spinner within a specific card
  toggleCardSpinner = (columnIndex, cardIndex) => {
    const spinner = this.state.columns[columnIndex].cards[cardIndex].spinner;
    this.setState((prevState) => {
      return {
        columns: [
          ...this.state.columns.slice(0, columnIndex),
          {
            ...this.state.columns[columnIndex],
            cards: [
              ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
              {
                ...this.state.columns[columnIndex].cards[cardIndex],
                spinner: !spinner
              },
              ...this.state.columns[columnIndex].cards.slice(cardIndex + 1)
            ]
          },
          ...this.state.columns.slice(columnIndex + 1)
        ]
      }
    });
  };

  // create new column in state and call postServerColumn to create it on the server
  createColumnHandler = (name) => {
    this.toggleColumnModalHandler(false);
    const columns = [...this.state.columns];
    const newColumn = {
      id: -1, // temporary id used for Column keys until id received from db
      spinner: true,
      name: name,
      position_id: this.state.columns.length,
      board_id: this.state.id,
      cards: []
    };
    columns.push(newColumn);
    this.setState({ columns: columns });
    this.postServerColumn(newColumn);
  };

  // edit existing column name on the server and update local state
  editColumnNameHandler = (columnIndex, name) => {
    this.toggleColumnModalHandler(false);
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        {
          ...this.state.columns[columnIndex],
          name: name,
          spinner: true
        },
        ...this.state.columns.slice(columnIndex + 1)
      ]
    },
      // call back function executed after setState completes  
      () => this.patchServerColumnName(columnIndex)
    )
  }

  // remove card from state and call deleteServerCard
  deleteCardHandler = (columnIndex, cardIndex) => {
    this.toggleCardCrudHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    const cardId = column.cards[cardIndex].id;

    column.cards.splice(cardIndex, 1);
    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });

    this.deleteServerCard(cardId);
  };

  // edit existing card on the server and update local state
  editCardDetailHandler = (columnIndex, cardIndex, task) => {
    this.toggleCardCrudHandler(false);

    const card = { ...this.state.columns[columnIndex].cards[cardIndex] };
    card.task = task;

    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        {
          ...this.state.columns[columnIndex],
          cards: [
            ...this.state.columns[columnIndex].cards.slice(0, cardIndex),
            { ...card },
            ...this.state.columns[columnIndex].cards.slice(cardIndex + 1)
          ]
        },
        ...this.state.columns.slice(columnIndex + 1)
      ]
    },
      // call back function executed after setState completes  
      () => this.patchServerCardDetail(columnIndex, cardIndex)
    );
  };

  // create new card in state and call postServerCard to create it on the server
  createCardHandler = (columnIndex, task) => {
    this.toggleCardCrudHandler(false);

    const column = { ...this.state.columns[columnIndex] };
    column.cards = [...this.state.columns[columnIndex].cards];
    const new_card = {
      id: -1, // temporary id used for Card keys until id received from db
      spinner: true,
      task: task,
      column_id: column.id,
      position_id: column.cards.length
    }
    column.cards.push(new_card);

    this.setState({
      columns: [
        ...this.state.columns.slice(0, columnIndex),
        column,
        ...this.state.columns.slice(columnIndex + 1)
      ]
    });

    this.postServerCard(columnIndex, new_card);
  };

  // display / hide modal with message
  toggleModalHandler = (message = null) => {
    this.setState({ modal: message });
  };

  render() {
    let output = <Spinner />;
    if (!this.state.retrieving_data) {
      const columns = this.state.columns.map((column, index) => {
        if (column.collapsed) {
          return <CollapsedColumn
            {...column}
            key={column.id}
            columnIndex={index}
            numCards={column.cards.length}
            toggleColumn={this.toggleColumnHandler}
          />
        } else {
          return <Column
            {...column}
            key={column.id}
            columnIndex={index}
            reorderCard={this.reorderCardHandler}
            moveCard={this.moveCardHandler}
            toggleColumn={this.toggleColumnHandler}
            toggleCardCrud={this.toggleCardCrudHandler}
            toggleColumnModal={this.toggleColumnModalHandler}
          />
        }
      });

      // display Column modal if this.state.columnModal.active
      let columnModal = null;
      if (this.state.columnModal.active) {
        const column = this.state.columns[
          this.state.columnModal.columnIndex];
        columnModal = <ColumnModal
          {...this.state.columnModal}
          name={column ? column.name : null}
          toggleColumnModal={this.toggleColumnModalHandler}
          createColumn={this.createColumnHandler}
          editColumnName={this.editColumnNameHandler}
        />
      }

      // display CardCrud modal if this.state.cardCrud.active
      let cardCrud = null;
      if (this.state.cardCrud.active) {
        const card = this.state.columns[
          this.state.cardCrud.columnIndex]
          .cards[this.state.cardCrud.cardIndex];
        cardCrud = <CardCrud
          {...this.state.cardCrud}
          task={card ? card.task : null}
          toggleCardCrud={this.toggleCardCrudHandler}
          editCardDetail={this.editCardDetailHandler}
          deleteCard={this.deleteCardHandler}
          createCard={this.createCardHandler}
        />
      }

      output = (
        <BoardContainer>
          <BoardControls
            toggleColumnModal={this.toggleColumnModalHandler}
          />
          <ColumnsContainer>
            {columnModal}
            {cardCrud}
            {columns}
          </ColumnsContainer>
        </BoardContainer>
      )
    }

    let modal = null;
    if (this.state.modal) {
      modal = <Modal
        message={this.state.modal}
        toggleModal={this.toggleModalHandler} />
    }

    return (
      <Fragment>
        {modal}
        {output}
      </Fragment>
    )
  }
}

export const BoardComponentOnly = Board; // used for shallow unit testing
export default DragDropContext(HTML5Backend)(Board);
