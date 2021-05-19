import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import withExternalData from '../../withExternalData';
import HyperCardList from './HyperCardList';

/**
  * Name Generator List Interface
  */

const NameGeneratorList = ({
  prompt,
  promptBackward,
  promptForward,
  stage: { prompts },
}) => {
  return (
    <div className="name-generator-list-interface">
      <div className="name-generator-list-interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={prompts}
        />
        <HyperCardList />
      </div>
    </div>
  );
};

NameGeneratorList.propTypes = {
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorList.defaultProps = {

};

export default compose(
  withPrompt,
  withExternalData('stage.dataSource', 'externalData'),
)(NameGeneratorList);
