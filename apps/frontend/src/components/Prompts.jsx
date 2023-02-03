import { Prompts as UIPrompts } from '@codaco/ui';
import { useSelector } from 'react-redux';

const Prompts = (props) => {
  const speakable = useSelector((state) => state.deviceSettings.enableExperimentalTTS);

  return <UIPrompts speakable={speakable} {...props} />;
};

export default Prompts;
