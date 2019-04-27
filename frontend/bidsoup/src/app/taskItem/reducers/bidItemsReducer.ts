import * as fromActions from '../actions/bidItemsActions';
import { BidItem } from '@app/types/types';
import { Reducer } from 'redux';

export interface BidItemsState {
  isFetching: boolean;
  list: BidItem[];
  lastFetch: number | null;
}

const defaultState: BidItemsState = {
  isFetching: false,
  list: [],
  lastFetch: null
};

const bidItemsReducer: Reducer<BidItemsState> = (state = defaultState, action: fromActions.Actions) => {
  switch (action.type) {
    case fromActions.REQUEST_BID_ITEMS:
      return {
        ...state,
        isFetching: true,
      };
    case fromActions.RECEIVE_BID_ITEMS:
      return {
        isFetching: false,
        list: action.payload,
        lastFetch: Date.now()
      };
    default:
      return state;
  }
};

export default bidItemsReducer;