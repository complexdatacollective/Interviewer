import React, { useState } from 'react';
import { get } from 'lodash';
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
  const [selectAll, setSelectAll] = useState(false);

  const pairedServer = useSelector(state => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);

  const sessions = useSelector(state => state.sessions);
  const installedProtocols = useSelector(state => state.installedProtocols);

  const handleSessionCardClick = (sessionUUID) => {
    console.log('clicked', sessionUUID);
    // set selected state here.
  };

  const formattedSessions = [...Object.keys(sessions)].map((sessionUUID) => {
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
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  const exportSessionsToFile = () => {
    const selectedSessions = Object.keys(sessions);

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
    <Section className="start-screen-section data-export-section">
      <main className="data-export-section__main">
        <header>
          <h2>Export Data</h2>
        </header>
        <div className="content-area">
          <p>Content area.</p>
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
        </div>
      </main>
      <footer className="data-export-section__footer">
        <Switch
          className="header-toggle"
          label="Select all"
          on={selectAll}
          onChange={() => setSelectAll(!!selectAll)}
        />
        <div className="content-area__buttons">
          <Button color="platinum" onClick={exportSessionsToFile}>To File</Button>
          { pairedServerConnection === 'ok' && (<Button key="unpair" color="platinum">To Server</Button>)}
        </div>
      </footer>
    </Section>
  );
};

export default DataExportSection;
