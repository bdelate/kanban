// react imports
import React, { Component } from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  active: PropTypes.bool.isRequired,
  columnIndex: PropTypes.number.isRequired,
  cardIndex: PropTypes.number.isRequired,
  task: PropTypes.string,
  toggleCardCreateUpdate: PropTypes.func.isRequired,
  editCardDetail: PropTypes.func.isRequired,
  createCard: PropTypes.func.isRequired
};

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background-color: #000;
  opacity: 0.9;
  z-index: 100;
`;

const Content = styled.div`
  top: 50%;
  left: 50%;
  position: fixed;
  transform: translate(-50%, -50%);
  border-radius: 2px;
  padding: 1rem;
  background-color: #005792;
`;

class CardCreateUpdate extends Component {
  state = {
    task: ''
  };

  componentDidMount() {
    if (this.props.task) {
      this.setTaskHandler(this.props.task);
    }
  }

  setTaskHandler = task => {
    this.setState({ task: task });
  };

  render() {
    let saveButton;
    if (this.props.cardIndex === -1) {
      saveButton = (
        <button
          id="idSaveCardButton"
          disabled={this.state.task.length === 0}
          onClick={() =>
            this.props.createCard(this.props.columnIndex, this.state.task)
          }
        >
          Save
        </button>
      );
    } else {
      saveButton = (
        <button
          id="idSaveCardButton"
          disabled={this.state.task.length === 0}
          onClick={() =>
            this.props.editCardDetail(
              this.props.columnIndex,
              this.props.cardIndex,
              this.state.task
            )
          }
        >
          Save
        </button>
      );
    }

    return (
      <Container>
        <Content>
          <textarea
            name="task"
            cols="40"
            rows="10"
            required=""
            id="idTaskText"
            placeholder="Task details..."
            defaultValue={this.props.task}
            onChange={e => this.setTaskHandler(e.target.value)}
          />
          {saveButton}
          <button onClick={() => this.props.toggleCardCreateUpdate(false)}>
            Cancel
          </button>
        </Content>
      </Container>
    );
  }
}

CardCreateUpdate.propTypes = propTypes;

export default CardCreateUpdate;
