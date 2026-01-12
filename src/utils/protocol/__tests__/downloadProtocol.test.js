/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';

import electron from 'electron';
import path from 'path';
import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import downloadProtocol from '../downloadProtocol';

vi.mock('electron');
vi.mock('request-promise-native');
vi.mock('../../filesystem');

it.todo('downloadProtocol');
