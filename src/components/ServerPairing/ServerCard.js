import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import logo from '../../images/Srv-Flat.svg';

const ServerCard = (props) => {
  const {
    server,
    selected,
    clickHandler,
  } = props;

  const {
    name,
  } = server;

  const classes = cx({
    'server-card': true,
    'server-card--selected': selected,
  });

  console.log('SC', props);
  return (
    <motion.div
      className={classes}
      key={server}
      selected={selected}
      onClick={() => clickHandler(server)}
    >
      <div className="server-card__content">
        <div className="server-card__icon">
          <img src={logo} alt="Available Server" />
        </div>
        <div className="main-wrapper">
          <h2 className="card__label">
            { name }
          </h2>
        </div>
      </div>
    </motion.div>
  );
};

ServerCard.propTypes = {
};

ServerCard.defaultProps = {
};

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ServerCard);

