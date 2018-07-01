// react imports
import React, { Component } from 'react';

// project imports
import Button from '../UI/Button';
import Textarea from '../UI/Textarea';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  toggleModal: PropTypes.func.isRequired,
  udpateCard: PropTypes.func,
  createCard: PropTypes.func
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
    if (this.props.task) {
      saveButton = (
        <Button
          domProps={{
            id: 'idSaveCardButton',
            disabled: this.state.task.length === 0,
            onClick: () => this.props.updateCard(this.state.task)
          }}
        >
          Save
        </Button>
      );
    } else {
      saveButton = (
        <Button
          domProps={{
            id: 'idSaveCardButton',
            disabled: this.state.task.length === 0,
            onClick: () => this.props.createCard(this.state.task)
          }}
        >
          Create
        </Button>
      );
    }

    return (
      <Container>
        <Content>
          <Textarea
            domProps={{
              name: 'task',
              cols: '40',
              rows: '10',
              required: '',
              id: 'idTaskText',
              placeholder: 'Task details...',
              defaultValue: this.props.task,
              onChange: e => this.setTaskHandler(e.target.value)
            }}
          />
          <div>
            {saveButton}
            <Button domProps={{ onClick: this.props.toggleModal }}>
              Cancel
            </Button>
          </div>
        </Content>
      </Container>
    );
  }
}

CardCreateUpdate.propTypes = propTypes;

export default CardCreateUpdate;
