/* eslint-disable global-require */
/* global window, FileTransfer */

import Promise from 'bluebird';
import environments from '../environments';
import inEnvironment from '../Environment';
import { writeStream } from '../filesystem';
import { friendlyErrorMessage } from '../../ducks/modules/errors';

const getURL = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

const getProtocolNameFromUrl = url => url.pathname.split('/').pop();

const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request');
    const path = require('path');
    const electron = require('electron');

    return (uri) => {
      const tempPath = (electron.app || electron.remote.app).getPath('temp');

      return getURL(uri)
        .then(url => [
          url.href,
          path.join(tempPath, getProtocolNameFromUrl(url)),
        ])
        .catch(friendlyErrorMessage("The location you gave us doesn't seem to be valid. Check the location, and try again."))
        .then(([url, destination]) => writeStream(destination, request({ uri: url })))
        .catch(friendlyErrorMessage("Your device doesn't have an active internet connection, so we weren't able to fetch your protocol at this time. Connect to a network, and try again."));
    };
  }

  if (environment === environments.CORDOVA) {
    return uri =>
      getURL(uri)
        .then(url => [
          url.href,
          `cdvfile://localhost/temporary/${getProtocolNameFromUrl(url)}`,
        ])
        .catch(friendlyErrorMessage("The location you gave us doesn't seem to be valid. Check the location, and try again."))
        .then(([url, destination]) =>
          new Promise((resolve, reject) => {
            const fileTransfer = new FileTransfer();
            fileTransfer.download(
              url,
              destination,
              () => resolve(destination),
              error => reject(error),
            );
          }),
        )
        .catch((error) => {
          const getErrorMessage = ({ code }) => {
            if (code === 1) return "We couldn't find a Network Canvas protocol at the location you gave us. Check the location, and try again.";
            if (code === 3) return "Your device doesn't have an active internet connection, so we weren't able to fetch your protocol at this time. Connect to a network, and try again.";
            return "The location you gave us doesn't seem to be valid. Check the location, and try again.";
          };

          friendlyErrorMessage(getErrorMessage(error))(error);
        });
  }

  throw new Error(`downloadProtocol() not available on platform ${environment}`);
});

export default downloadProtocol;
