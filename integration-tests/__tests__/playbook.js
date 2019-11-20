/* eslint-env jest */

import path from 'path';
import fakeDialog from 'spectron-fake-dialog';
import { timing, paths, mockProtocol } from '../config';
import getData from '../getData';
import { forceClick } from './helpers';

/**
 * common tasks for using protocols
 */

export const loadProtocolFromFile = async (app, filename) => {
  const mockProtocolPath = path.join(paths.dataDir, filename);
  const mockFilenames = [mockProtocolPath];

  await fakeDialog.mock([{ method: 'showOpenDialog', value: mockFilenames }]);
  await app.client.isVisible('.getting-started');
  await app.client.click('[name=add-a-protocol]');
  await app.client.waitForVisible('.protocol-import-dialog__tabs');
  await app.client.click('.tab=Local file');
  await app.client.waitForVisible('h4=Protocol imported successfully!');
  await app.client.click('button=Continue');
  await app.client.pause(timing.medium);
  await app.client.click('button.overlay__close');
  await app.client.waitForExist('.modal', timing.long, true);
};

/**
 * For reuse when testing interfaces
 */
export const loadMockProtocolAsFile = async (app) => {
  await getData(mockProtocol)
    .then(([, filename]) => {
      console.info(`loading protocol at "${filename}".`);
      return loadProtocolFromFile(app, filename);
    });
};

export const loadProtocolFromNetwork = async (app, url = mockProtocol) => {
  await app.client.isVisible('.getting-started');
  await app.client.click('[name=add-a-protocol]');
  await app.client.waitForVisible('.protocol-import-dialog__tabs');
  await app.client.click('.tab=From URL');
  await app.client.pause(timing.medium);
  await app.client.setValue('input[name=protocol_url]', url);
  await app.client.click('button=Import');
  await app.client.waitForVisible('h4=Protocol imported successfully!', 120000); // 2 minutes
  await app.client.click('button=Continue');
  await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
};

export const startInterview = async (app, caseId = 'test') => {
  await app.client.click('[data-clickable="start-interview"]');
  await app.client.setValue('input[name=case_id]', caseId);
  await app.client.click('button=Start interview');
  await app.client.waitForVisible('.protocol');
};

export const goToStage = async (app, stageId) => {
  if (!stageId) { throw Error('goToStage() requires a stageId'); }
  await app.client.click('.progress-bar');
  await app.client.waitForVisible('.main-menu-stages-menu');
  // await app.client.click(`[data-stage-id=${stageId}]`);
  forceClick(app, `[data-stage-id=${stageId}]`);
  await app.client.pause(timing.long);
};
