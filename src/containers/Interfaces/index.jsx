import { has } from 'lodash';

import { Icon } from '@codaco/ui';

import { StageType } from '../../protocol-consts';
import AlterEdgeForm from './AlterEdgeForm';
import AlterForm from './AlterForm';
import CategoricalBin from './CategoricalBin';
import DyadCensus from './DyadCensus';
import EgoForm from './EgoForm';
import FinishSession from './FinishSession';
import Information from './Information';
import NameGenerator from './NameGenerator';
import NameGeneratorAutoComplete from './NameGeneratorAutoComplete';
import NameGeneratorList from './NameGeneratorList';
import NameGeneratorQuickAdd from './NameGeneratorQuickAdd';
import NameGeneratorRoster from './NameGeneratorRoster';
import Narrative from './Narrative';
import OrdinalBin from './OrdinalBin';
import Sociogram from './Sociogram';
import TieStrengthCensus from './TieStrengthCensus';

const interfaces = {
  [StageType.NameGenerator]: NameGenerator,
  [StageType.NameGeneratorQuickAdd]: NameGeneratorQuickAdd,
  [StageType.NameGeneratorAutoComplete]: NameGeneratorAutoComplete,
  [StageType.NameGeneratorRoster]: NameGeneratorRoster,
  [StageType.NameGeneratorList]: NameGeneratorList,
  [StageType.Sociogram]: Sociogram,
  [StageType.Information]: Information,
  [StageType.OrdinalBin]: OrdinalBin,
  [StageType.CategoricalBin]: CategoricalBin,
  [StageType.Narrative]: Narrative,
  [StageType.AlterForm]: AlterForm,
  [StageType.EgoForm]: EgoForm,
  [StageType.AlterEdgeForm]: AlterEdgeForm,
  [StageType.DyadCensus]: DyadCensus,
  [StageType.TieStrengthCensus]: TieStrengthCensus,
  FinishSession,
};

const getInterface = (interfaceConfig) => {
  const divStyle = {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (has(interfaces, interfaceConfig)) {
    return interfaces[interfaceConfig];
  }
  return () => (
    <div style={divStyle}>
      <div style={{ textAlign: 'center' }}>
        <Icon name="warning" />
        <h1 style={{ marginTop: '1rem' }}>
          No &quot;
          {interfaceConfig}
          &quot; interface found.
        </h1>
      </div>
    </div>
  );
};

export default getInterface;
