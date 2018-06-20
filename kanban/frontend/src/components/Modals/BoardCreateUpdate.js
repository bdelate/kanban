// react imports
import React, { Component } from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  name: PropTypes.string,
  toggleBoardCreateUpdate: PropTypes.func.isRequired,
  createBoard: PropTypes.func.isRequired,
  updateBoard: PropTypes.func.isRequired
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
  opacity: 1;
  padding: 15px;
  background-color: #005792;
`;

class BoardCreateUpdate extends Component {
  state = {
    name: ''
  };

  componentDidMount() {
    if (this.props.name) {
      this.setTaskHandler(this.props.name);
    }
  }

  setTaskHandler = name => {
    this.setState({ name: name });
  };

  render() {
    let saveButton;
    if (this.props.name) {
      saveButton = (
        <button
          id="idSaveBoardButton"
          disabled={this.state.name.length === 0}
          onClick={() => this.props.updateBoard(this.state.name)}
        >
          Save
        </button>
      );
    } else {
      saveButton = (
        <button
          id="idSaveBoardButton"
          disabled={this.state.name.length === 0}
          onClick={() => this.props.createBoard(this.state.name)}
        >
          Save
        </button>
      );
    }

    return (
      <Container>
        <Content>
          <input
            name="name"
            required=""
            id="idName"
            placeholder="Board name..."
            defaultValue={this.props.name}
            onChange={e => this.setTaskHandler(e.target.value)}
          />
          {saveButton}
          <button onClick={() => this.props.toggleBoardCreateUpdate(false)}>
            Cancel
          </button>
        </Content>
      </Container>
    );
  }
}

BoardCreateUpdate.propTypes = propTypes;

export default BoardCreateUpdate;
