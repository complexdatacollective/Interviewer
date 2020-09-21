import React, { useState } from 'react';
import { get } from 'lodash';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Button } from '@codaco/ui';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import { Section } from '.';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';
import Switch from './Switch';
import { NewFilterableListWrapper } from '../../components';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const DataExportSection = () => {
  const [selectedSessions, setSelectedSessions] = useState([]);

  const pairedServer = useSelector(state => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);

  const sessions = useSelector(state => state.sessions);
  const installedProtocols = useSelector(state => state.installedProtocols);

  const toggleSelectAll = () => {
    if ((Object.keys(sessions).length !== selectedSessions.length)) {
      setSelectedSessions(Object.keys(sessions));
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
    const session = useSelector(state => state.sessions[sessionUUID]);

    const {
      caseId,
      startedAt,
      updatedAt,
    } = session;

    const protocol = useSelector(state => get(state.installedProtocols, [session.protocolUID]));
    const progress = Math.round(
      (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
    );

    return {
      caseId,
      progress,
      startedAt,
      updatedAt,
      key: sessionUUID,
      protocolName: protocol.name,
      sessionUUID,
      selected: selectedSessions.includes(sessionUUID),
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  const exportSessionsToFile = () => {
    exportToFile(selectedSessions.map((session) => {
      const sessionProtocol =
        installedProtocols[sessions[session].protocolUID];

      return asNetworkWithSessionVariables(
        session,
        sessions[session],
        sessionProtocol,
      );
    }));
  };

  return (
    <AnimateSharedLayout>
      <Section className="start-screen-section data-export-section">
        <motion.main layout className="data-export-section__main">
          <motion.header layout>
            <h2>Export &amp; Manage Interview Data</h2>
          </motion.header>
          <motion.div layout className="content-area">
            Select one or more interview sessions by tapping then, and then delete or export
            them using the buttons provided.
          </motion.div>
          <NewFilterableListWrapper
            ItemComponent={SessionCard}
            items={formattedSessions}
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
          <motion.div
            className="selection-status"
            layout
          >
            <Switch
              className="header-toggle"
              label="Select all"
              on={(Object.keys(sessions).length === selectedSessions.length)}
              onChange={toggleSelectAll}
            />
            { selectedSessions.length > 0 &&
              (<span>{ selectedSessions.length} selected session{ selectedSessions.length > 1 ? ('s') : null }.</span>)}
          </motion.div>
        </motion.main>
        <motion.footer layout className="data-export-section__footer">
          <Button color="neon-coral--dark" onClick={exportSessionsToFile} disabled={selectedSessions.length === 0}>Delete Selected</Button>
          <div className="action-buttons">
            { pairedServerConnection === 'ok' && (<Button key="unpair" color="mustard" disabled={pairedServerConnection !== 'ok' || selectedSessions.length === 0}>Export Selected To Server</Button>)}
            <Button color="platinum" onClick={exportSessionsToFile} disabled={selectedSessions.length === 0}>Export Selected To File</Button>
          </div>
        </motion.footer>
      </Section>
    </AnimateSharedLayout>
  );
};

export default DataExportSection;
