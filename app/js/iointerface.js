/* global require, console */
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

    // this could be a remote host
    // Type 3: Persistent datastore with automatic loading
    var Datastore = require('nedb');
    var path = require('path');
    var db;
    var id;
    var interface = {};

    interface.init = function(callback) {
        // After init, first priority is to load previous session for this protocol.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        global.tools.notify('ioInterface initialising.', 1);
        console.log('iointerface reporting on session name:');
        console.log(global.session.name);
        db = new Datastore({ filename: path.join(window.require('nw.gui').App.dataPath, global.session.name+'.db'), autoload: true });


        db.find({}).sort({date: 1 }).exec(function (err, docs) {
            console.log(docs);
            if (err) {
                // handle error
                console.log('error with loading the database.');
            }
            if (docs.length !== undefined && docs.length > 0) {
                console.log('found a session. Returning: ');
                console.log(docs[0]);
                callback(docs[0]._id);
            } else {
                console.log('no existing session, creating one.');
                var sessionDate = new Date();
                db.insert([{date:sessionDate}], function (err, newDoc) {
                    if(err) {
                      // do something with the error
                        console.log('error with insert');
                    }
                    console.log(newDoc);
                    console.log(newDoc[0]._id);

                    // Two documents were inserted in the database
                    // newDocs is an array with these documents, augmented with their _id
                    id = newDoc[0]._id;
                    console.log('id has been set as '+id);
                    callback(newDoc[0]._id);
                });
            }

        });

    };


    interface.save = function(userData, id) {
        delete global.session.userData._id;
        global.tools.notify('IOInterface being asked to synchronise with data store:',2);
        global.tools.notify('Data to be saved: ', 1);
        global.tools.notify(userData, 1);

        db.update({_id: id }, userData, {}, function (err) {
            if (err) {
                console.log('saving failed');
            }

            console.log('saving worked...id for find: '+id);
            db.find({"_id": id }, function (err, docs) {
                if (err) {
                    console.log('error with finding');
                    console.log(err);
                    // handle error
                }
                console.log('data is now: ');
                console.log(docs[0]);
            });
        });

    };

    interface.update = function(key, userData,id) {
        db.update({_id: id }, userData, {}, function (err) {
            if (err) {
                console.log('saving failed');
            }

            console.log('update worked.');
            db.find({"_id": id }, function (err, docs) {
                if (err) {
                    console.log('error with finding');
                    console.log(err);
                    // handle error
                }
                console.log('new data is: ');
                console.log(docs[0]);
            });
        });

    };

    interface.reset = function(callback) {
        // db.find with empty object returns all objects.
        db.find({}, function (err, docs) {
            if (err) {
                console.log('resetting failed');
                return false;
            }

            var resultLength = docs.length;
            for (var i = 0; i < resultLength; i++) {
                interface.deleteDocument(docs[i]._id);
            }

            if (callback) { callback(); }
        });
    };

    interface.deleteDocument = function(callback) {
        db.remove({ _id: global.session.id }, {}, function (err) {
            if (err) { console.log('deleting document failed.'); return false; }
            console.log('Deleted document '+id);
            if(callback) { callback(); }
        });
    };

    interface.load = function(callback, id) {
        console.log('loading...id is '+id);
        global.tools.notify("ioInterface being asked to load data.", 2);
        db.find({"_id": id}, function (err, docs) {
            if (err) {
                // handle error
                console.log('error');
            }
            console.log('loading worked. Returning: ');
            console.log(docs[0]);
            callback(docs[0]);
        });
    };

    return interface;
};

module.exports = new IOInterface();
