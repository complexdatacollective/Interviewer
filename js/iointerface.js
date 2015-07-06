/* global window, require */
/* exported IOInterface */


/*

This module should provide a transparent interface for any part of the application to store data.

It functions as a key/value store.

  - The requesting module first requests a data slot, or recieves a pointer to an existing one. If a data slot
    with the specified key already exists, the pointer is returned, else a new pointer is generated along with
    the slot.
  - The ioInterface instance decides when the key store should be synced with the external data store vs. the
    local backup (localStorage API), but this syncing can be triggered manually.
  - Only keys that have been modified should be synced to avoid large data transfer.

*/

var IOInterface = function IOInterface() {
    'use strict';
    // this could be a remote host
    // Type 3: Persistent datastore with automatic loading
    var Datastore = require('nedb');
    var path = require('path');
    var db;
    var id;
    var ioInterface = {};
    var initialised = false;

    ioInterface.init = function(callback) {

        if (!callback) {
            return false;
        }
        // After init, first priority is to load previous session for this protocol.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        global.tools.notify('ioInterface initialising.', 1);
        global.tools.notify('Using '+global.session.name+' as database name.', 1);

        db = new Datastore({ filename: path.join(window.require('nw.gui').App.dataPath, global.session.name+'.db'), autoload: true });


        db.find({}).sort({'sessionParameters.date': 1 }).exec(function (err, docs) {
            if (err) {
                return false;
                // handle error
            }
            if (docs.length !== undefined && docs.length > 0) {
                global.tools.notify('ioInterface finished initialising.', 1);
                initialised = true;
                callback(docs[0]._id);

                return true;
            } else {
                var sessionDate = new Date();
                db.insert([{'sessionParameters':{'date':sessionDate}}], function (err, newDoc) {
                    if(err) {
                        return false;
                      // do something with the error
                    }

                    // Two documents were inserted in the database
                    // newDocs is an array with these documents, augmented with their _id
                    id = newDoc[0]._id;

                    initialised = true;
                    callback(newDoc[0]._id);
                    global.tools.notify('ioInterface finished initialising.', 1);
                    return true;
                });
            }

        });

    };

    ioInterface.initialised = function() {
        if (initialised) {
            return true;
        } else {
            return false;
        }
    };

    ioInterface.save = function(sessionData, id) {
        delete global.session.sessionData._id;
        global.tools.notify('IOInterface being asked to save to data store.',1);
        global.tools.notify('Data to be saved: ', 2);
        global.tools.notify(sessionData, 2);

        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            global.tools.notify('Saving complete.', 1);
        });

    };

    ioInterface.update = function(key, sessionData,id) {
        global.tools.notify('IOInterface being asked to update data store.',1);
        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            global.tools.notify('Updating complete.', 1);
        });

    };

    ioInterface.reset = function(callback) {
        // db.find with empty object returns all objects.
        db.find({}, function (err, docs) {
            if (err) {
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
        global.tools.notify('ioInterface being asked to delete document.', 2);
        db.remove({ _id: global.session.id }, {}, function (err) {
            if (err) {
                return false;
            }
            global.tools.notify('Deleting complete.', 2);
            if(callback) { callback(); }
        });
    };

    ioInterface.load = function(callback, id) {
        global.tools.notify('ioInterface being asked to load data.', 2);
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
