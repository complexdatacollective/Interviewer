import React, { useState } from 'react';
import { every, get, includes, pickBy } from 'lodash';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import { Section } from '.';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';
import { NewFilterableListWrapper, Switch } from '../../components';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const DataExportSection = () => {
  const sessions = useSelector(state => state.sessions);

  const [selectedSessions, setSelectedSessions] = useState([]);

  const pairedServer = useSelector(state => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);
  const installedProtocols = useSelector(state => state.installedProtocols);

  const dispatch = useDispatch();
  const deleteSession = id => dispatch(sessionsActions.removeSession(id));
  const openDialog = dialog => dispatch(dialogActions.openDialog(dialog));

  const handleFilterChange = () => setSelectedSessions([]);

  const handleDeleteSessions = () => {
    openDialog({
      type: 'Warning',
      title: `Delete ${selectedSessions.length} Interview Session${selectedSessions.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Permanently Delete',
      onConfirm: () => {
        selectedSessions.map(session => deleteSession(session));
        setSelectedSessions([]);
      },
      message: (
        <p>
          This action will delete the selected interview data and cannot be undone.
          Are you sure you want to continue?
        </p>
      ),
    });
  };

  const getUnexportedSessions = () =>
    Object.keys(pickBy(sessions, session => !session.exportedAt));

  const isUnexportedSelected = () => getUnexportedSessions().length > 0 &&
    (every(getUnexportedSessions(), session => includes(selectedSessions, session))) &&
    (getUnexportedSessions().length === selectedSessions.length);

  const toggleSelectAll = () => {
    if ((Object.keys(sessions).length !== selectedSessions.length)) {
      setSelectedSessions(Object.keys(sessions));
      return;
    }

    setSelectedSessions([]);
  };

  const toggleSelectUnexported = () => {
    const unexportedSessions = getUnexportedSessions();
    if (!isUnexportedSelected()) {
      setSelectedSessions(unexportedSessions);
      return;
    }

    setSelectedSessions([]);
  };

  const handleSessionCardClick = (sessionUUID) => {
    if (selectedSessions.includes(sessionUUID)) {
      setSelectedSessions([
        ...selectedSessions.filter(session => session !== sessionUUID),
      ]);

      return;
    }

    setSelectedSessions(alreadySelected => [
      ...alreadySelected,
      sessionUUID,
    ]);
  };

  const formattedSessions = [...Object.keys(sessions)].map((sessionUUID) => {
    const session = sessions[sessionUUID];

    const {
      caseId,
      startedAt,
      updatedAt,
      finishedAt,
      exportedAt,
    } = session;

    const protocol = get(installedProtocols, [session.protocolUID]);
    const progress = Math.round(
      (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
    );

    return {
      caseId,
      progress,
      startedAt,
      finishedAt,
      updatedAt,
      exportedAt,
      key: sessionUUID,
      protocolName: protocol.name,
      sessionUUID,
      selected: selectedSessions.includes(sessionUUID),
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  const exportSessions = (toServer = false) => {
    const exportFunction = toServer ? exportToServer : exportToFile;

    exportFunction(selectedSessions.map((session) => {
      const sessionProtocol = installedProtocols[sessions[session].protocolUID];

      return asNetworkWithSessionVariables(
        session,
        sessions[session],
        sessionProtocol,
      );
    }));
  };

  if (Object.keys(sessions).length === 0) { return null; }

  const isSelectAll = (
    Object.keys(sessions).length > 0
    && (Object.keys(sessions).length === selectedSessions.length)
  );

  const resetFilter = [isSelectAll, isUnexportedSelected()];

  return (
    <Section className="start-screen-section data-export-section">
      <motion.main layout className="data-export-section__main">
        <motion.header layout>
          <h2>Export &amp; Manage Interview Data</h2>
        </motion.header>
        <motion.div layout className="content-area">
          Select one or more interview sessions by tapping them, and then delete or export
          using the buttons provided. Remember that you can change export options from the
          settings menu, which can be opened from the header at the top of this screen.
        </motion.div>
        <NewFilterableListWrapper
          ItemComponent={SessionCard}
          items={formattedSessions}
          propertyPath={null}
          initialSortProperty="updatedAt"
          initialSortDirection="desc"
          onFilterChange={handleFilterChange}
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
          resetFilter={resetFilter}
        />
        <motion.div
          className="selection-status"
          layout
        >
          <div>
            <Switch
              className="header-toggle"
              label="Select un-exported"
              on={isUnexportedSelected()}
              onChange={toggleSelectUnexported}
            />
            <Switch
              className="header-toggle"
              label="Select all"
              on={isSelectAll}
              onChange={toggleSelectAll}
            />
          </div>
          { selectedSessions.length > 0 &&
            (<span>{ selectedSessions.length} selected session{ selectedSessions.length > 1 ? ('s') : null }.</span>)}
        </motion.div>
      </motion.main>
      <motion.footer layout className="data-export-section__footer">
        <Button color="neon-coral--dark" onClick={handleDeleteSessions} disabled={selectedSessions.length === 0}>Delete Selected</Button>
        <div className="action-buttons">
          { pairedServerConnection === 'ok' && (<Button onClick={() => exportSessions(true)} color="mustard" disabled={pairedServerConnection !== 'ok' || selectedSessions.length === 0}>Export Selected To Server</Button>)}
          <Button color="platinum" onClick={() => exportSessions(false)} disabled={selectedSessions.length === 0}>Export Selected To File</Button>
        </div>
      </motion.footer>
    </Section>
  );
};

export default DataExportSection;
