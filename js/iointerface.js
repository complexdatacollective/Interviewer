/* global window, require, note, nodeRequire, isNodeWebkit */
/* exported IOInterface */

var IOInterface = function IOInterface() {
    'use strict';
    var Datastore = require('nedb');
    var path = require('path');
    var db;
    var ioInterface = {};
    var initialised = false;

    ioInterface.init = function(callback) {

        var dbLocation = path.join('database/', window.netCanvas.Modules.session.name+'.db');

        // Use the node version of nedb when in the node webkit environment.
        if(isNodeWebkit === true) {
            Datastore = nodeRequire('nedb');
            path = nodeRequire('path');
            dbLocation = path.join(nodeRequire('nw.gui').App.dataPath, window.netCanvas.Modules.session.name+'.db');
        }

        // After init, first priority is to to to load previous session for this protocol.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        note.info('ioInterface initialising.');
        note.debug('Using '+window.netCanvas.Modules.session.name+' as database name.');

        db = new Datastore({ filename: dbLocation, autoload: true });
        initialised = true;
        callback();

    };

    ioInterface.getLastSession = function(callback) {
      note.debug('ioInterface.getLastSession()');
        db.find({}).exec(function (err, docs) {
            if (err) {
                return false;
                // handle error
            }
            note.trace(docs);
            if (docs.length !== undefined && docs.length > 0) {
                initialised = true;
                note.trace('ioInterface.getLastSession(): previous session found. Returning.');
                callback(docs[0]);
                return true;
            } else {
                ioInterface.newSession(function(newDoc) {
                    initialised = true;
                    note.trace('ioInterface.getLastSession(): returning a new session.');
                    callback(newDoc);
                    return true;
                });
            }

        });
    };

    ioInterface.newSession = function(callback) {
        var sessionDate = new Date();
        db.insert([{'sessionParameters':{'date':sessionDate}}], function (err, newDoc) {
            if(err) {
                note.error(err);
                return false;
            }

            note.debug('ioInterface added a new session with id '+newDoc[0]._id);

            callback(newDoc[0]);
            return true;
        });
    };

    ioInterface.getSessions = function(callback) {
        db.find({}, function (err, docs) {
            if (err) {
                // handle error
                return false;
            }
            callback(docs);
        });

    };

    ioInterface.getDB = function() {
        return db;
    };

    ioInterface.initialised = function() {
        if (initialised) {
            return true;
        } else {
            return false;
        }
    };

    ioInterface.save = function(sessionData, id) {
      note.debug('ioInterface.save(): '+id);
        delete sessionData._id;
        note.debug(sessionData);

        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            note.debug('Saving complete.');
        });

    };

    ioInterface.update = function(key, sessionData,id) {
        note.debug('IOInterface being asked to update data store.');
        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            note.debug('Updating complete.');
        });

    };

    ioInterface.reset = function(callback) {
        // db.find with empty object returns all objects.
        db.find({}, function (err, docs) {
            if (err) {
                note.error(err);
                return false;
            }

            var resultLength = docs.length;
            for (var i = 0; i < resultLength; i++) {
                ioInterface.deleteDocument(docs[i]._id);
            }

            if (callback) { callback(); }
        });
    };

    ioInterface.deleteDocument = function(id, callback) {
      if(!id) {
        return false;
      }
        note.info('ioInterface deleting document with id '+id);
        db.remove({ _id: id }, {}, function (err) {
            if (err) {
                note.error(err);
                return false;
            }
            note.debug('Deleting complete.');
            if(callback) { callback(); }
        });
    };

    ioInterface.load = function(id, callback) {
        note.info('ioInterface loading data.');
        db.find({'_id': id}, function (err, docs) {
            if (err) {
                // handle error
                return false;
            }
            callback(docs[0]);
        });
    };

    return ioInterface;
};

module.exports = new IOInterface();
