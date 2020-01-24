import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { CategoricalItem } from '../../components';
import { getEntityAttributes, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import Overlay from '../Overlay';

const formatBinDetails = (nodes, getNodeLabel) => {
  if (nodes.length === 0) {
    return '';
  }

  // todo: the following should be updated to reflect the sort order of the bins
  const name = getNodeLabel(nodes[0]);

  return `${name}${nodes.length > 1 ? ` and ${nodes.length - 1} other${nodes.length > 2 ? 's' : ''}` : ''}`;
};

const CategoricalListItem = ({
  id,
  size,
  isExpanded,
  accentColor,
  activePromptVariable,
  bin,
  index,
  sortOrder,
  getNodeLabel,
  onExpandBin,
  updateNode,
}) => {
  const isOtherVariable = !!bin.otherVariable;
  const binDetails = formatBinDetails(bin.nodes, getNodeLabel);

  const handleDrop = ({ meta }) => {
    const binValue = bin.value;

    if (isOtherVariable) {
      console.log('other variable');
      // this.openOtherFieldWindow();
      return;
    }

    if (getEntityAttributes(meta)[activePromptVariable] === [binValue]) {
      return;
    }

    updateNode(
      meta[entityPrimaryKeyProperty],
      {},
      { [activePromptVariable]: [binValue] },
    );
  };

  const handleExpandBin = (e) => {
    if (e) { e.stopPropagation(); }
    onExpandBin(index);
  };

  return (
    <div
      className="categorical-list__item"
      style={{ width: `${size}px`, height: `${size}px` }}
      key={index}
      onClick={handleExpandBin}
    >
      <CategoricalItem
        id={id}
        key={index}
        label={bin.label}
        accentColor={accentColor}
        onDrop={handleDrop}
        onClick={handleExpandBin}
        details={binDetails}
        isExpanded={isExpanded}
        nodes={bin.nodes}
        sortOrder={sortOrder}
      />
      <Overlay show={false}>
        testing
      </Overlay>
    </div>
  );
};

CategoricalListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  activePromptVariable: PropTypes.string.isRequired,
  bin: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  sortOrder: PropTypes.func.isRequired,
  getNodeLabel: PropTypes.func.isRequired,
  onExpandBin: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  accentColor: PropTypes.string,
  size: PropTypes.number,
};

CategoricalListItem.defaultProps = {
  accentColor: null,
  size: 0,
};

export { CategoricalListItem };

const mapDispatchToProps = {
  updateNode: sessionsActions.updateNode,
};

export default compose(
  connect(null, mapDispatchToProps),
)(CategoricalListItem);
