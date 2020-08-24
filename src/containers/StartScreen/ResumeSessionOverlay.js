import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEmpty, get } from 'lodash';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { NewFilterableListWrapper } from '../../components';

import { Overlay } from '../Overlay';
import { entityAttributesProperty } from '../../ducks/modules/network';

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const emptyView = (
  <div className="session-list-container--empty">
    <div className="getting-started">
      <h1 className="getting-started__header">No previous interviews found</h1>
      <p>
        You have no in-progress interview sessions available to resume.
        To begin a new session, select a protocol from the main start screen.
      </p>
    </div>
  </div>
);

const SessionList = ({ sessions, installedProtocols }) => {
  if (isEmpty(sessions)) {
    return emptyView;
  }

  const newSessions = [...Object.keys(sessions)].map((sessionUUID) => {
    const session = sessions[sessionUUID];
    const protocol = get(installedProtocols, [session.protocolUID]);

    const progress = Math.round(
      (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
    );

    return {
      caseId: session.caseId,
      startedAt: session.startedAt,
      updatedAt: session.updatedAt,
      protocolName: protocol.name,
      progress,
      onClickHandler: () => console.log('cleek'),
    };
  });

  return (
    <Overlay
      show
      onClose={() => {}}
      title="Select an Interview to Resume"
    >
      <NewFilterableListWrapper
        ItemComponent={SessionCard}
        items={newSessions}
        // itemPropertyFormatter={item => ({
        //   ...item,
        //   [entityAttributesProperty]: {
        //     ...item,
        //   },
        // })}
        propertyPath={null}
        initialSortProperty="updatedAt"
        initialSortDirection="desc"
        sortableProperties={[
          {
            label: 'Last Changed',
            variable: 'updatedAt',
          },
          {
            label: 'Case ID',
            variable: 'caseId',
          },
          {
            label: 'Progress',
            variable: 'progress',
          },
        ]}
      />
    </Overlay>
  );
};

SessionList.propTypes = {
  sessions: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    sessions: state.sessions,
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
