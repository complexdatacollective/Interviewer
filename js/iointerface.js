/* global window, require, note, nodeRequire, isNodeWebkit */
/* exported IOInterface */

var IOInterface = function IOInterface() {
    'use strict';
    var Datastore = require('nedb');
    var path = require('path');
    var db;
    var id;
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

        if (!callback) {
            return false;
        }
        // After init, first priority is to load previous session for this protocol.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        note.info('ioInterface initialising.');
        note.debug('Using '+window.netCanvas.Modules.session.name+' as database name.');

        db = new Datastore({ filename: dbLocation, autoload: true });
        db.find({}).sort({'sessionParameters.date': 1 }).exec(function (err, docs) {
            if (err) {
                return false;
                // handle error
            }
            if (docs.length !== undefined && docs.length > 0) {
                note.debug('ioInterface finished initialising.');
                initialised = true;
                callback(docs[0]._id);

                return true;
            } else {
                var sessionDate = new Date();
                db.insert([{'sessionParameters':{'date':sessionDate}}], function (err, newDoc) {
                    if(err) {
                        note.error(err);
                        return false;
                    }

                    // Two documents were inserted in the database
                    // newDocs is an array with these documents, augmented with their _id
                    id = newDoc[0]._id;

                    initialised = true;
                    callback(newDoc[0]._id);
                    note.debug('ioInterface finished initialising.');
                    return true;
                });
            }

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
        delete window.netCanvas.Modules.session.sessionData._id;
        note.info('IOInterface saving.');
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

    ioInterface.deleteDocument = function(callback) {
        note.info('ioInterface deleting document.');
        db.remove({ _id: window.netCanvas.Modules.session.id }, {}, function (err) {
            if (err) {
                note.error(err);
                return false;
            }
            note.debug('Deleting complete.');
            if(callback) { callback(); }
        });
    };

    ioInterface.load = function(callback, id) {
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
