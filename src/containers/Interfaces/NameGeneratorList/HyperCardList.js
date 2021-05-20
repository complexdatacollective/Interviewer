import React, { useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '../../../components/Card';
import { FixedSizeGrid as Grid } from 'react-window';

const ListContext = React.createContext([]);

const cellRender = (Component, { columnCount }) => ({
  columnIndex,
  rowIndex,
  style,
}) => {
  const items = useContext(ListContext);
  const dataIndex = (columnIndex * columnCount) + rowIndex;
  const data = items[dataIndex];

  // console.log({ data });

  // {
  //   id: `select-${prompt.id}`,
  //   listId: `select-${prompt.id}`,
  //   details: this.detailsWithVariableUUIDs,
  //   title: prompt.text,
  //   label: getCardTitle,
  //   getCardTitle,
  //   onItemClick: this.toggleCard,
  //   isItemSelected: this.isNodeSelected,
  // }

  return (
    <div style={style}>
      <Component {...data} />
    </div>
  );
};

/**
  * HyperCardList
  */
const HyperCardList = ({
  items,
  itemRenderer: ItemRenderer,
  gridOptions,
}) => {
  const CellifiedRenderer = useRef(cellRender(ItemRenderer, gridOptions));

  return (
    <div className="hyper-card-list" style={{
      height: 0,
    }}>
      <ListContext.Provider value={items}>
        <Grid
          {...gridOptions}
          height={650}
          width={850}
        >
          {CellifiedRenderer.current}
        </Grid>
      </ListContext.Provider>
    </div>
  );
};

HyperCardList.propTypes = {
};

HyperCardList.defaultProps = {
  itemRenderer: () => null,
  gridOptions: {
    columnCount: 2,
    columnWidth: 400,
    rowCount: 100,
    rowHeight: 300,
  },
};

export default HyperCardList;
