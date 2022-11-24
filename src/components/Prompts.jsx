import React from 'react';
import UIPrompts from '@codaco/ui/lib/components/Prompts/Prompts';
import { useSelector } from 'react-redux';

const Prompts = (props) => {
  const speakable = useSelector((state) => state.deviceSettings.enableExperimentalTTS);

  return <UIPrompts speakable={speakable} {...props} />;
};

export default Prompts;
