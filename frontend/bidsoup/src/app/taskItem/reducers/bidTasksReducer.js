import tasksActions from '../actions/bidTasksActions';
import { isEmpty } from '../../utils/utils';

const defaultState = {
  areFetching: false,
  list: [],
  lastFetch: null
}

const bidTasks = (state = defaultState, action) => {
  switch(action.type) {
    case tasksActions.REQUEST_BID_TASKS:
      console.log('requesting tasks');
      return {
        ...state,
        areFetching: true
      };
    case tasksActions.RECEIVE_BID_TASKS:
      console.log('receiving tasks');
      return {
        areFetching: false,
        list: action.payload,
        lastFetch: Date.now()
      };
    case tasksActions.CREATE_BID_TASK:
      console.log('Creating task');
      console.log('action: ', action);
      return state;
    default:
      return state;
  }
};

const selectTask = (state = null, action) => {
  switch(action.type) {
    case tasksActions.SELECT_BID_TASK:
      return action.task;
    default:
      return state;
  }
};

const bidTasksReducer = {
  bidTasks,
  selectTask
};

export default bidTasksReducer;
