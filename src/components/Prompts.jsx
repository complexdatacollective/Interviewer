import { useSelector } from 'react-redux';

import UIPrompts from '@codaco/ui/lib/components/Prompts/Prompts';

const Prompts = (props) => {
  const speakable = useSelector(
    (state) => state.deviceSettings.enableExperimentalTTS,
  );

  return <UIPrompts speakable={speakable} {...props} />;
};

export default Prompts;
