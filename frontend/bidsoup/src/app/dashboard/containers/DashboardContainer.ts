import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import { Actions as BidActions, fetchCustomerList, setAndFetchBidByKey } from '../actions/bidActions';
import { Actions as AccountActions } from '../../actions/accountActions';
import { createUnitType } from '../actions/unitActions';
import { array2HashByKey } from '../../utils/sorting';
import { fetchApi } from '../../taskItem/actions/apiActions';
import { BidItem, Category, Bid, Customer, AppState, Unit } from 'src/app/types/types';
import { UnitDict } from 'src/app/taskItem/actions/unitTypeActions';
import { ThunkDispatch } from 'redux-thunk';

const itemsByCategory = (items: BidItem[], categories: Category[]) => {
  let sortedItems = array2HashByKey(items, 'category');
  return Object.keys(sortedItems).reduce(
    (all, category) => {
      let cat = categories.find(el => el.url === category);
      let catWithItems = {
        ...cat,
        items: sortedItems[category]
      };
      return {
        ...all,
        [category]: catWithItems
      };
    },
    {});
};

const bidWithCustomer = (bid: Bid, customers: Customer[]) => {
  let customer = customers.find(c => bid.customer === c.url);
  return {
    ...bid,
    customer: customer ? customer.name : '--'
  };
};

const itemsWithTotal = (items: BidItem[], units: UnitDict) => (
  items.map(item => {
    let total = 0;
    if (item.price) {
      total = Number(item.price) * Number(item.quantity);
    } else {
      let unitPrice = Number(units[item.unitType!].unitPrice);
      total = unitPrice * Number(item.quantity);
    }
    return {
      ...item,
      total
    };
  })
);

const unitsArray = (units: UnitDict) => (
  Object.keys(units).map(unit => ({
    ...units[unit],
    unitPrice: Number(units[unit].unitPrice)
  }))
);

interface OwnProps {
  match: {
    params: {
      account: string;
      bid: string;
    }
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
  bids: state.bids.list,
  selectedBid: bidWithCustomer(state.bids.selectedBid, state.customers.list) as Bid,
  categoriesWithItems: itemsByCategory(
    itemsWithTotal(state.bidData.items.list, state.bidData.units.units),
    state.bidData.categories.list
  ),
  customers: state.customers.list,
  bid: ownProps.match.params.bid,
  units: unitsArray(state.bidData.units.units)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, never, AccountActions | BidActions>, ownProps: OwnProps) => ({
  loadPage: () => {
    dispatch(AccountActions.setAccount(ownProps.match.params.account));
    return dispatch(fetchApi());
      // commented out becuse of .then problem on void
      // .then(() => dispatch(fetchCustomerList()))
      // .then(() => dispatch(fetchBidListByAccount()));
  },
  fetchCustomers: () => dispatch(fetchCustomerList()),
  selectBid: () => dispatch(setAndFetchBidByKey(Number.parseInt(ownProps.match.params.bid))),
  clearSelectedBid: () => dispatch(BidActions.clearSelectedBid()),
  createUnitType: (unit: Partial<Unit>) => dispatch(createUnitType(unit))
});

const DashboardContainer = connect<ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>>(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
