/* global window, require */
/* exported IOInterface */

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
        // After init, first priority is to tro to load previous session for this protocol.
        // We might not be able to, because of space constraints.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        window.tools.notify('ioInterface initialising.', 1);
        window.tools.notify('Using '+window.netCanvas.Modules.session.name+' as database name.', 1);

        db = new Datastore({ filename: path.join('database/', window.netCanvas.Modules.session.name+'.db'), autoload: true });
        console.log('db created');
        console.log(db);

        db.find({}).sort({'sessionParameters.date': 1 }).exec(function (err, docs) {
            if (err) {
                return false;
                // handle error
            }
            if (docs.length !== undefined && docs.length > 0) {
                window.tools.notify('ioInterface finished initialising.', 1);
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
                    window.tools.notify('ioInterface finished initialising.', 1);
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
        delete window.netCanvas.Modules.session.sessionData._id;
        window.tools.notify('IOInterface being asked to save to data store.',1);
        window.tools.notify('Data to be saved: ', 2);
        window.tools.notify(sessionData, 2);

        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            window.tools.notify('Saving complete.', 1);
        });

    };

    ioInterface.update = function(key, sessionData,id) {
        window.tools.notify('IOInterface being asked to update data store.',1);
        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            window.tools.notify('Updating complete.', 1);
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
        window.tools.notify('ioInterface being asked to delete document.', 2);
        db.remove({ _id: window.netCanvas.Modules.session.id }, {}, function (err) {
            if (err) {
                return false;
            }
            window.tools.notify('Deleting complete.', 2);
            if(callback) { callback(); }
        });
    };

    ioInterface.load = function(callback, id) {
        window.tools.notify('ioInterface being asked to load data.', 2);
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
