import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import { Actions as BidActions, fetchCustomerList, setAndFetchBidByKey, fetchBidListByAccount } from '../actions/bidActions';
import { Actions as AccountActions } from '../../actions/accountActions';
import { createUnitType } from '../actions/unitActions';
import { array2HashByKey } from '../../utils/sorting';
import { fetchApi, Actions } from '../../taskItem/actions/apiActions';

const itemsByCategory = (items, categories) => {
  let sortedItems = array2HashByKey(items, 'category');
  return Object.keys(sortedItems).reduce((all, category) => {
    let cat = categories.find(el => el.url === category);
    let catWithItems = {
      ...cat,
      items: sortedItems[category]
    }
    return {
      ...all,
      [category]: catWithItems
    }
  }, {});
};

const bidWithCustomer = (bid, customers) => {
  let customer = customers.find(c => bid.customer === c.url);
  return {
    ...bid,
    customer: customer ? customer.name : '--'
  };
};

const itemsWithTotal = (items, units) => (
  items.map(item => {
    let total = 0;
    if (item.price) {
      total = Number(item.price) * Number(item.quantity);
    } else {
      let unitPrice = Number(units[item.unitType].unitPrice);
      total = unitPrice * Number(item.quantity);
    }
    return {
      ...item,
      total
    };
  })
);

const anythingFetching = state => {
  let {tasks, categories, items, units} = state.bidData;
  return state.bids.isFetching || tasks.isFetching || categories.isFetching || items.isFetching || units.isFetching;
};

const unitsArray = units => (
  Object.keys(units).map(unit => ({
    ...units[unit],
    unitPrice: Number(units[unit].unitPrice)
  }))
);

const mapStateToProps = (state, ownProps) => ({
  bids: state.bids.list,
  selectedBid: bidWithCustomer(state.bids.selectedBid, state.customers.list),
  categoriesWithItems: itemsByCategory(
    itemsWithTotal(state.bidData.items.list, state.bidData.units.units),
    state.bidData.categories.list
  ),
  customers: state.customers.list,
  bid: ownProps.match.params.bid,
  units: unitsArray(state.bidData.units.units)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadPage: () => {
    dispatch(AccountActions.setAccount(ownProps.match.params.account));
    return dispatch(fetchApi())
      .then(() => dispatch(fetchCustomerList()))
      .then(() => dispatch(fetchBidListByAccount()))
  },
  fetchCustomers: () => dispatch(fetchCustomerList()),
  selectBid: () => dispatch((_, getState) => {
      dispatch(setAndFetchBidByKey(Number.parseInt(ownProps.match.params.bid)));
  }),
  clearSelectedBid: () => dispatch(BidActions.clearSelectedBid()),
  createUnitType: unit => dispatch(createUnitType(unit))
});

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;