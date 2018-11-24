import * as React from 'react';
import styled from 'styled-components';
import BidOverview from './BidOverview';
import BidSelectorContainer from '../containers/BidSelectorContainer';
import { Bid, BidItem, Unit, Customer } from '../../types/types';
import { theme } from '../../utils/color';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const OverviewContainer = styled.div`
  flex-grow: 1;
  background-color: ${theme.background.hex};
  padding: 1em 3em;
  overflow: scroll;
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${theme.components.scrollbar.hex};
  }
`;

export interface CategoryWithItems {
  bid: string;
  color: string;
  description: string;
  markup_percent: string | null;
  items: ItemWithTotal[];
  name: string;
  url: string;
}

interface ItemWithTotal extends BidItem {
  total: number;
}

interface Props {
  bid: string;
  bids: Bid[];
  units: Unit[];
  customers: Customer[];
  selectedBid: Bid;
  categoriesWithItems: {
    [s: string]: CategoryWithItems;
  };
  loadPage: () => any;
  selectBid: () => any;
  createUnitType: (u: Partial<Unit>) => any;
  clearSelectedBid: () => any;
  fetchCustomers: () => any;
}
interface OwnProps {
  match: {
    params: {
      account: string;
      bid: string;
    }
  }
}

class Dashboard extends React.Component<Props & OwnProps> {
  componentDidMount() {
    if (this.props.bids.length <= 0) {
      this.props.loadPage()
      .then(() => {
        if (this.props.bid) {
          this.props.selectBid();
        } else {
          this.props.clearSelectedBid();
        }
      });
    } else if (this.props.customers.length <= 0) {
       this.props.fetchCustomers();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.bid !== this.props.bid) {
      this.props.selectBid();
    }
  }

  generateBody() {
    if (this.props.selectedBid.url) {
      return (
        <BidOverview
          bid={this.props.selectedBid}
          categoriesWithItems={this.props.categoriesWithItems}
          units={this.props.units}
          createUnitType={this.props.createUnitType}
        />
      );
    }
    return 'Select a Bid to learn more';
  }

  render() {
    return (
      <Container>
        <BidSelectorContainer/>
        <OverviewContainer>
          {this.generateBody()}
        </OverviewContainer>
      </Container>
    );
  }
}

export default Dashboard;
