import React, { useState } from 'react';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import CloseButton from '../CloseButton';
import { getProtocolStages } from '../../../selectors/protocol';
import { Scroller } from '../../../components';
import Timeline from '../../../components/MainMenu/Timeline';

const StagesMenu = (props) => {
  // const [open, toggleMenu] = useState(true);
  const [filter, setFilter] = useState('');

  const onFilterChange = event => setFilter(event.target.value || '');

  const filteredStageList = props.stages.filter(
    stage => stage.label.toLowerCase().includes(filter.toLowerCase()));

  return (
    <motion.div
      className="stages-menu"
      key="stages-menu"
      variants={props.animationVariants}
      initial="expanded"
      exit="expanded"
      animate="normal"
    >
      <header className="stages-menu__header">
        <h1>Interview Menu</h1>
        <CloseButton onClick={() => props.toggleExpanded(false)} />
      </header>
      <article className="stages-menu__wrapper">
        {/* <aside>
          <div className="summary-panel">
            <h2>Interview Summary</h2>
            <Scroller>
              <ul>
                <li>Duration: 23:04</li>
                <li>Nodes (249):</li>
                <ul>
                  <li>Person: 12</li>
                  <li>Infant: 2</li>
                  <li>Animal: 235</li>
                </ul>
                <li>Edges (15):</li>
                <ul>
                  <li>Friend: 2</li>
                  <li>Enemy: 1</li>
                  <li>Romance: 12</li>
                </ul>
              </ul>
            </Scroller>
          </div>
          <Button>Finish Interview</Button>
        </aside> */}
        <section>
          <header>
            <h4>Filter: </h4>
            <Text
              type="search"
              placeholder="Filter Stages..."
              input={{
                onChange: onFilterChange,
              }}
            />
          </header>
          <Timeline items={filteredStageList} />
        </section>
      </article>
    </motion.div>
  );
};

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
});

function mapStateToProps(state) {
  const currentStages = getProtocolStages(state);

  const withIndex = currentStages.map((stage, index) => ({ ...stage, index }));

  return {
    stages: withIndex,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(StagesMenu);
