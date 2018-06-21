// react imports
import React, { Component } from 'react';

// project imports
import Board, { BoardComponentOnly } from './Board';
import Column from '../Column/Column';
import Spinner from '../../components/Spinner/Spinner';
import Info from '../../components/Modals/Info';
import Confirm from '../../components/Modals/Confirm';
import CardCreateUpdate from '../../components/Modals/CardCreateUpdate';
import ColumnCreateUpdate from '../../components/Modals/ColumnCreateUpdate';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moxios from 'moxios';

configure({ adapter: new Adapter() });

const props = {
  id: 1,
  authToken: 'authToken'
};

beforeEach(function() {
  // mock axios calls to the server
  moxios.install();
});

afterEach(function() {
  moxios.uninstall();
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

// Wraps a component in a DragDropContext that uses the dnd TestBackend.
function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        return <DecoratedComponent {...props} />;
      }
    }
  );
}

it('only displays a spinner when mounted (ie: retrieving data)', () => {
  const board = shallow(<BoardComponentOnly {...props} />);
  expect(board.find(Column).length).toEqual(0);
  expect(board.find(Spinner).length).toEqual(1);
});

it('calls retrieveData when mounted', () => {
  const spy = jest.spyOn(BoardComponentOnly.prototype, 'retrieveData');
  const wrapper = shallow(<BoardComponentOnly {...props} />);
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should have column instance when not retrieving data', () => {
  const state = {
    retrievingData: false,
    columns: [
      {
        id: 0,
        name: 'first column',
        cards: [{ id: 0, task: 'first column first task' }]
      }
    ]
  };

  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.update();
  expect(board.find(Column).length).toEqual(1);
  expect(board.find(Spinner).length).toEqual(0);
});

it('should move card when moveCardHandler is called', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        cards: [
          {
            id: 0,
            task: 'first column first task',
            position_id: 0,
            column_id: 0
          },
          {
            id: 1,
            task: 'first column second task',
            position_id: 1,
            column_id: 0
          }
        ]
      },
      {
        id: 1,
        name: 'second column',
        cards: []
      }
    ]
  };

  const board = shallow(<Board {...props} />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.moveCardHandler(0, 0, 1);
  expect(boardInstance.state.columns[0].cards.length).toBe(1);
  expect(boardInstance.state.columns[1].cards.length).toBe(1);
  expect(boardInstance.state.columns[1].cards[0].task).toBe(
    'first column first task'
  );
  expect(boardInstance.state.columns[1].cards[0].position_id).toBe(0);
  expect(boardInstance.state.columns[1].cards[0].column_id).toBe(1);
});

it('should reorder cards when reorderCardHandler is called while hovering', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        cards: [
          { id: 0, task: 'first task', position_id: 0 },
          { id: 1, task: 'second task', position_id: 1 }
        ]
      }
    ]
  };
  const args = {
    hasDropped: false,
    columnIndex: 0,
    fromCardIndex: 0,
    toCardIndex: 1
  };
  const board = shallow(<Board {...props} />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.reorderCardHandler(args);
  expect(boardInstance.state.columns[0].cards.length).toBe(2);
  expect(boardInstance.state.columns[0].cards[0].task).toBe('second task');
  expect(boardInstance.state.columns[0].cards[1].task).toBe('first task');
});

it('should call patchServerCards when reorderCardHandler on card drop', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        cards: [
          { id: 0, task: 'first task', position_id: 0 },
          { id: 1, task: 'second task', position_id: 1 }
        ]
      }
    ]
  };
  const args = {
    hasDropped: true,
    columnIndex: 0,
    toCardIndex: 1
  };

  // use wrapper to allow jest to spy on what is actually an arrow function
  const patchServerCards = jest.fn();
  class BoardWrapper extends BoardComponentOnly {
    constructor(props) {
      super(props);
      this.patchServerCards = patchServerCards;
    }
  }

  const board = shallow(<BoardWrapper {...props} />);
  const boardInstance = board.instance();
  boardInstance.setState(state);
  boardInstance.reorderCardHandler(args);
  expect(patchServerCards).toHaveBeenCalledTimes(1);
});

it('should toggle column.collapsed when toggleColumnHandler is called', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task' }]
      }
    ]
  };

  const board = shallow(<Board {...props} />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.toggleColumnHandler(0);
  expect(boardInstance.state.columns[0].collapsed).toBeTruthy();
});

it('should display error modal if patchServerCards Fails', async () => {
  moxios.stubRequest('/api/cards/', {
    status: 404
  });
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'original task', position_id: 0 }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().patchServerCards(0);
  await flushPromises();
  board.update();
  expect(board.find(Info).length).toEqual(1);
});

it('toggles ColumnCreateUpdate component when toggleColumnCreateUpdateHandler is called', () => {
  const state = {
    retrievingData: false,
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  // initially there is no modal
  expect(board.find(ColumnCreateUpdate).length).toBe(0);

  // display modal
  board.instance().toggleColumnCreateUpdateHandler(true);
  board.update();
  expect(board.find(ColumnCreateUpdate).length).toBe(1);

  // close modal
  board.instance().toggleColumnCreateUpdateHandler(false);
  board.update();
  expect(board.find(ColumnCreateUpdate).length).toBe(0);
});

it('toggles CardCreateUpdate component when toggleCardCreateUpdateHandler is called', () => {
  const state = {
    retrievingData: false,
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  // initially there is no modal
  expect(board.find(CardCreateUpdate).length).toBe(0);

  // display modal
  board.instance().toggleCardCreateUpdateHandler(true, 0);
  board.update();
  expect(board.find(CardCreateUpdate).length).toBe(1);

  // close modal
  board.instance().toggleCardCreateUpdateHandler(false);
  board.update();
  expect(board.find(CardCreateUpdate).length).toBe(0);
});

it('creates new column when createColumnHandler is called', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().createColumnHandler('new column');
  board.update();
  expect(board.state().columns.length).toBe(2);
  expect(board.state().columns[1].name).toEqual('new column');
});

it('update column name when editColumnNameHandler is called', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0 }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().editColumnNameHandler(0, 'new column name');
  await flushPromises();
  board.update();
  expect(board.state().columns[0].name).toEqual('new column name');
});

it('displays modal when editColumnNameHandler call to server fails', async () => {
  moxios.stubRequest(/api\/columns\/*/, {
    status: 404
  });
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'original task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().editColumnNameHandler(0, 'new column name');
  await flushPromises();
  board.update();
  expect(board.find(Info).length).toEqual(1);
});

it('updates column positions ids when non last column is deleted', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        position_id: 0,
        cards: []
      },
      {
        id: 1,
        name: 'second column',
        position_id: 1,
        cards: []
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().deleteColumnHandler(0);
  board.update();
  expect(board.state().columns.length).toEqual(1);
  expect(board.state().columns[0].name).toEqual('second column');
  expect(board.state().columns[0].position_id).toEqual(0);
});

it('deletes column with no other updates if last column is deleted', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        position_id: 0,
        cards: []
      },
      {
        id: 1,
        name: 'second column',
        position_id: 1,
        cards: []
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().deleteColumnHandler(1);
  board.update();
  expect(board.state().columns.length).toEqual(1);
  expect(board.state().columns[0].name).toEqual('first column');
  expect(board.state().columns[0].position_id).toEqual(0);
});

it('updates card positions ids when non last card is deleted', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        cards: [
          { id: 0, position_id: 0, task: 'first task' },
          { id: 1, position_id: 1, task: 'second task' }
        ]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().deleteCardHandler(0, 0);
  board.update();
  expect(board.state().columns[0].cards.length).toEqual(1);
  expect(board.state().columns[0].cards[0].task).toEqual('second task');
  expect(board.state().columns[0].cards[0].position_id).toEqual(0);
});

it('deletes card with no other updates if last column card is deleted', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task' }, { id: 1, task: 'second task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().deleteCardHandler(0, 1);
  board.update();
  expect(board.state().columns[0].cards.length).toEqual(1);
  expect(board.state().columns[0].cards[0].task).toEqual('first task');
  expect(board.state().columns[0].cards[0].position_id).toEqual(0);
});

it('update card task when editCardDetailHandler is called', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0 }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().editCardDetailHandler(0, 0, 'new task text');
  await flushPromises();
  board.update();
  expect(board.state().columns[0].cards[0].task).toEqual('new task text');
});

it('displays modal when editCardDetailHandler call to server fails', async () => {
  moxios.stubRequest(/api\/cards\/*/, {
    status: 404
  });
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'original task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().editCardDetailHandler(0, 0, 'new task text');
  await flushPromises();
  board.update();
  expect(board.find(Info).length).toEqual(1);
});

it('create new card when createCardHandler is called with valid card', () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ]
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  board.instance().createCardHandler(0, 'new task');
  board.update();
  expect(board.state().columns[0].cards.length).toBe(1);
  expect(board.state().columns[0].cards[0].task).toEqual('new task');
});

it('should merge previous state if postServerColumn fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/columns/', {
    status: 400,
    response: {}
  });
  const newColumn = {
    id: -1,
    spinner: true,
    name: 'new column name',
    position_id: 1,
    board_id: 1,
    cards: []
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().postServerColumn(newColumn);
  await flushPromises();
  expect(board.state().columns.length).toBe(1);
  expect(board.state().value).toEqual('fake previous state value');
});

it('should replace last column with response from postServerColumn', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0 }]
      },
      {
        id: -1,
        spinner: true,
        name: 'new column name',
        position_id: 1,
        board_id: 1,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  const newColumn = {
    id: -1,
    spinner: true,
    name: 'new column name',
    position_id: 1,
    board_id: 1,
    cards: []
  };
  moxios.stubRequest('/api/columns/', {
    status: 201,
    response: {
      id: 5,
      name: 'new column name',
      position_id: 1,
      board_id: 1,
      cards: []
    }
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().postServerColumn(newColumn);
  await flushPromises();
  expect(board.state().columns[1].id).toEqual(5);
  expect(board.state().columns[1].spinner).toBeUndefined;
});

it('should merge previous state if postServerColumn fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0 }]
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  const newColumn = {
    id: -1,
    spinner: true,
    name: 'new column name',
    position_id: 1,
    board_id: 1,
    cards: []
  };
  moxios.stubRequest('/api/columns/', {
    status: 400,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().postServerColumn(newColumn);
  await flushPromises();
  expect(board.state().columns.length).toBe(1);
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if patchServerColumnName fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/columns/0/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().patchServerColumnName(0);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if patchServerColumns fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  const column_update = [
    {
      id: 0,
      name: 'first column',
      collapsed: false,
      cards: []
    }
  ];
  moxios.stubRequest('/api/columns/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().patchServerColumns(column_update);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if patchServerCards fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0 }]
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/cards/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().patchServerCards([]);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if patchServerCardDetail fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: [{ id: 0, task: 'first task', position_id: 0, column_id: 0 }]
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/cards/0/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().patchServerCardDetail(0, 0);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if postServerCard fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/cards/', {
    status: 400,
    response: {}
  });
  const new_card = {
    id: -1,
    spinner: true,
    task: 'test task',
    column_id: 0,
    position_id: 0
  };
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().postServerCard(0, new_card);
  await flushPromises();
  expect(board.state().columns[0].cards.length).toBe(0);
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if deleteServerColumn fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/columns/100/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().deleteServerColumn(100);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('should merge previous state if deleteServerCard fails', async () => {
  const state = {
    columns: [
      {
        id: 0,
        name: 'first column',
        collapsed: false,
        cards: []
      }
    ],
    previousState: {
      value: 'fake previous state value'
    }
  };
  moxios.stubRequest('/api/cards/100/', {
    status: 404,
    response: {}
  });
  const board = shallow(<BoardComponentOnly {...props} />);
  board.setState(state);
  expect(board.state().value).toBeUndefined();
  board.instance().deleteServerCard(100);
  await flushPromises();
  expect(board.state().value).toEqual('fake previous state value');
});

it('hides confirm modal when toggleConfirmHandler called with no args', () => {
  const board = shallow(<BoardComponentOnly {...props} />);
  board.instance().toggleConfirmHandler();
  board.update();
  expect(board.find(Confirm).length).toEqual(0);
});

it('displays confirm modal when toggleConfirmHandler called with args', () => {
  const board = shallow(<BoardComponentOnly {...props} />);
  board.instance().toggleConfirmHandler('test message', jest.fn(), 0);
  board.update();
  expect(board.find(Confirm).length).toEqual(1);
  expect(board.state().confirmModal.message).toEqual('test message');
  expect(board.state().confirmModal.confirmFunction).toEqual(
    expect.any(Function)
  );
});

it('updates state and calls retrieveData when board id prop changes', () => {
  const retrieveData = jest.fn();
  BoardComponentOnly.prototype.retrieveData = retrieveData;

  const board = shallow(<BoardComponentOnly {...props} />);
  expect(retrieveData).toHaveBeenCalledTimes(1);

  // change board id
  board.setProps({ id: 2 });
  expect(board.state().id).toBe(2);
  expect(retrieveData).toHaveBeenCalledTimes(2);

  // board id doesn't change, therefore dont call retrieveData
  board.setProps({ id: 2 });
  expect(retrieveData).toHaveBeenCalledTimes(2);
});
