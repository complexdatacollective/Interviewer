import React, { useState, useEffect } from 'react';
import { get, difference } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';
import { Switch } from '../../components';
import { getFilteredList } from '../../components/NewFilterableListWrapper';
import formatDatestamp from '../../utils/formatDatestamp';
import Picker from '../../components/Picker';

const oneBasedIndex = (i) => parseInt(i || 0, 10) + 1;

const SessionSelect = ({
  show,
  selectedSessions: previouslySelectedSessions = [],
  onClose,
  onContinue,
}) => {
  const sessions = useSelector((state) => state.sessions);
  const [filterTerm, setFilterTerm] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState(previouslySelectedSessions);

  const pairedServer = useSelector((state) => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const dispatch = useDispatch();
  const deleteSession = (id) => dispatch(sessionsActions.removeSession(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const handleFilterChange = (term) => setFilterTerm(term);

  const handleDeleteSessions = () => {
    openDialog({
      type: 'Warning',
      title: `Delete ${selectedSessions.length} Interview Session${selectedSessions.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Permanently Delete',
      onConfirm: () => {
        selectedSessions.map((session) => deleteSession(session));
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

  const handleSessionCardClick = (sessionUUID) => {
    if (selectedSessions.includes(sessionUUID)) {
      setSelectedSessions([
        ...selectedSessions.filter((session) => session !== sessionUUID),
      ]);

      return;
    }

    setSelectedSessions((alreadySelected) => [
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
      startedAt: formatDatestamp(startedAt),
      finishedAt: formatDatestamp(finishedAt),
      updatedAt: formatDatestamp(updatedAt),
      exportedAt: formatDatestamp(exportedAt),
      key: sessionUUID,
      protocolName: protocol.name,
      sessionUUID,
      selected: selectedSessions.includes(sessionUUID),
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  const [filteredSessions, setFilteredSessions] = useState(formattedSessions);
  const filteredIds = filteredSessions.map(({ sessionUUID }) => sessionUUID);

  useEffect(() => {
    const newFilteredSessions = getFilteredList(formattedSessions, filterTerm, null);

    setFilteredSessions(newFilteredSessions);
  }, [filterTerm, selectedSessions]);

  const exportSessions = (toServer = false) => {
    onContinue(selectedSessions, toServer);
  };

  const isSelectAll = (
    selectedSessions.length > 0
    && selectedSessions.length === filteredIds.length
    && difference(selectedSessions, filteredIds).length === 0
  );

  const toggleSelectAll = () => {
    if (!isSelectAll) {
      setSelectedSessions([...filteredIds]);
      return;
    }

    setSelectedSessions([]);
  };

  const unexportedSessions = filteredSessions
    .reduce((acc, { exportedAt, sessionUUID }) => {
      if (exportedAt) { return acc; }
      return [...acc, sessionUUID];
    }, []);

  const isUnexportedSelected = (
    unexportedSessions.length > 0
    && selectedSessions.length > 0
    && selectedSessions.length === unexportedSessions.length
    && difference(selectedSessions, unexportedSessions).length === 0
  );

  const toggleSelectUnexported = () => {
    if (!isUnexportedSelected) {
      setSelectedSessions(unexportedSessions);
      return;
    }

    setSelectedSessions([]);
  };

  const exportedSessions = filteredSessions
    .reduce((acc, { exportedAt, sessionUUID }) => {
      if (!exportedAt) { return acc; }
      return [...acc, sessionUUID];
    }, []);

  const isExportedSelected = (
    exportedSessions.length > 0
    && selectedSessions.length > 0
    && selectedSessions.length === exportedSessions.length
    && difference(selectedSessions, exportedSessions).length === 0
  );

  const toggleSelectExported = () => {
    if (!isExportedSelected) {
      setSelectedSessions(exportedSessions);
      return;
    }

    setSelectedSessions([]);
  };

  return (
    <Picker
      show={show}
      onClose={onClose}
      title="Select Interview Sessions to Delete or Export"
      ItemComponent={SessionCard}
      items={filteredSessions}
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
      footer={(
        <div
          className="selection-status"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
          }}
        >
          <div className="selection-controls">
            <div>
              <Switch
                label="Select exported"
                on={isExportedSelected}
                onChange={toggleSelectExported}
              />
              <Switch
                label="Select un-exported"
                on={isUnexportedSelected}
                onChange={toggleSelectUnexported}
              />
              <Switch
                label="Select all"
                on={isSelectAll}
                onChange={toggleSelectAll}
              />
            </div>
            { selectedSessions.length > 0 && (
              <span>
                { selectedSessions.length}
                {' '}
                selected session
                { selectedSessions.length > 1 ? ('s') : null }
                .
              </span>
            )}
          </div>
          <div
            className="action-buttons"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flex: '1',
            }}
          >
            <Button color="neon-coral" onClick={handleDeleteSessions} disabled={selectedSessions.length === 0} icon="menu-purge-data">Delete Selected</Button>
            <div>
              { pairedServerConnection === 'ok' && (<Button onClick={() => exportSessions(true)} color="mustard" disabled={pairedServerConnection !== 'ok' || selectedSessions.length === 0}>Export Selected To Server</Button>)}
              <Button color="platinum" onClick={() => exportSessions(false)} disabled={selectedSessions.length === 0}>Export Selected To File</Button>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default SessionSelect;
