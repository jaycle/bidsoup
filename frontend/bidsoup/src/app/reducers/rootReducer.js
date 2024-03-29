import { combineReducers } from 'redux';
import bidComponentsReducer from '../taskItem/reducers/bidComponentsReducer'
import apiReducer from '../taskItem/reducers/apiReducer';
import uiReducer from '@app/reducers/uiReducer';
import bidReducer, { customersReducer } from '@dashboard/reducers/bidReducer';
import { accountReducer } from '@app/reducers/accountReducer';
import loginReducer from '@app/login/reducers/loginReducer';
import userAccountReducer from '@app/reducers/userAccountReducer';
import unitOptionsReducer from "@app/reducers/unitOptionsReducer";

const rootReducer = combineReducers({
  api: apiReducer,
  bids: bidReducer,
  unitOptions: unitOptionsReducer,
  bidData: bidComponentsReducer,
  customers: customersReducer,
  ui: uiReducer,
  account: accountReducer,
  login: loginReducer,
  user: userAccountReducer
});

export default rootReducer;
