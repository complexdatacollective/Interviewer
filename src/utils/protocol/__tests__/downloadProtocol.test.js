/* eslint-env jest */

import electron from 'electron';
import path from 'path';
import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import downloadProtocol from '../downloadProtocol';

jest.mock('electron');
jest.mock('request-promise-native');
jest.mock('../../filesystem');

it.todo('downloadProtocol');
