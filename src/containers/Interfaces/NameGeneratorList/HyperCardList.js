import React from 'react';
import PropTypes from 'prop-types';
import CardList from '../../../components/CardList';

/**
  * HyperCardList
  */
const HyperCardList = ({
  data
}) => {
  return (
    <div className="hyper-card-list">
      <CardList
        items=[]
      />
    </div>
  );
};

HyperCardList.propTypes = {
};

HyperCardList.defaultProps = {

};

export default HyperCardList;
