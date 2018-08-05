import React from 'react';
import styled from 'styled-components';
import Modal from '../../components/Modal';
import TaskTree from '../components/TaskTree';
import Card from '../../components/Card';
import NewTaskForm from './NewTaskForm';
import Fab from '../../components/Fab';
import Item from './Item';

const ViewConatiner = styled.div`
  display: flex;
  justify-content: center;
  width: 95%;
  height: 100%;
  margin: 0 auto;
  overflow: hidden;
`;

const TaskContent = Card.extend`
  min-width: 600px;
  overflow: scroll;
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ddd;
  }
`;

const ItemContent = Card.extend`
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-left: ${({shouldDisplay}) => (shouldDisplay
    ? '20px'
    : '0'
  )};
  transition: flex .3s ease;
  flex: ${({shouldDisplay}) => (shouldDisplay
    ? '1'
    : '0'
  )};
`;

const FabContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 500;
`;

const displayTaskItems = ({tableData, selectedTask}) => {
  if (tableData.length <= 0) {
    return null;
  } else {
    return (
      <Item
        tableData={tableData}
        selectedTask={selectedTask}
        key={selectedTask.url}
      />
    );
  }
}

const addElements = props => {
  if (props.ui.modalShowing) {
    return (
      <React.Fragment>
        <FabContainer>
          <Fab
            onClick={props.showModal}
            color={'#b71c2d'}
            icon={'add'}
          />
        </FabContainer>
        <Modal onClose={props.hideModal}>
          <p style={{fontSize: 'large'}}><b>Add a new task!</b></p>
          <NewTaskForm
            tasks={props.tasks}
            onAddTask={(task) => {
              props.hideModal();
              props.addTask(props.tasks[0].bid, task);
            }}
          />
        </Modal>
      </React.Fragment>
    );
  } else {
    return (
      <FabContainer>
        <Fab
          onClick={props.showModal}
          color={'#b71c2d'}
          icon={'add'}
        />
      </FabContainer>
    );
  }
}

const View = props => {
  let {categoriesAreFetching, itemsAreFetching} = props;
  if (props.tasks.length <= 0) {
    return (
      <React.Fragment>
        <button
          onClick={() => {
            props.fetchAllAndSelectFirst();
//            props.fetchBidList();
//            props.setCurrentBid();
//            props.refreshItems();
          }}
        >
          Click to load
        </button>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <ViewConatiner>
        <TaskContent>
          <TaskTree
            tasks={props.tasks}
            onTaskSelect={t => props.selectTask(t)}
          />
        </TaskContent>
        <ItemContent
          shouldDisplay={props.tableData.length > 0}
        >
          {displayTaskItems(props)}
        </ItemContent>
      </ViewConatiner>
      {addElements(props)}
    </React.Fragment>
  );
};

export default View;
