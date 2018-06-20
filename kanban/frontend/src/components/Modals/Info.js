// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  message: PropTypes.string.isRequired,
  toggleInfo: PropTypes.func.isRequired
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

const infoModal = props => (
  <Container>
    <Content>
      <div>{props.message}</div>
      <button onClick={() => props.toggleInfo()}>Close</button>
    </Content>
  </Container>
);

infoModal.propTypes = propTypes;

export default infoModal;
