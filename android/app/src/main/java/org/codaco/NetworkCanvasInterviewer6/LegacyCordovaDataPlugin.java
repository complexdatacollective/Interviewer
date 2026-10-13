package org.codaco.NetworkCanvasInterviewer6;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.File;

/**
 * Reads the redux store the Cordova builds of Interviewer (6.5.x and earlier)
 * persisted with cordova-sqlite-storage, so the web layer can migrate it into
 * IndexedDB (src/utils/legacyCordovaMigration.js). Read only: the old database
 * is never changed.
 *
 * With androidDatabaseProvider 'system' the plugin kept `redux-store-db` in the
 * app's standard databases directory, with one table, `redux_store (key, value)`.
 */
@CapacitorPlugin(name = "LegacyCordovaData")
public class LegacyCordovaDataPlugin extends Plugin {
  private static final String DATABASE_NAME = "redux-store-db";

  // A cursor row must fit in a 2 MB CursorWindow, and a store with many
  // interviews is larger, so the value is read in slices of this many
  // characters (at most 4 bytes each in UTF-8).
  private static final int CHUNK_CHARACTERS = 256 * 1024;

  /**
   * Resolves { exists: false } when there is no legacy database, otherwise
   * { exists: true, value } where value is the stored string for `key`, or null
   * when the table or row is missing.
   */
  @PluginMethod
  public void readState(PluginCall call) {
    String key = call.getString("key");
    if (key == null) {
      call.reject("key is required");
      return;
    }

    File databaseFile = getContext().getDatabasePath(DATABASE_NAME);
    JSObject result = new JSObject();

    if (!databaseFile.exists()) {
      result.put("exists", false);
      call.resolve(result);
      return;
    }

    result.put("exists", true);

    // Read-write so SQLite can roll back a hot journal left by an interrupted
    // write; only SELECTs are run.
    try (SQLiteDatabase database =
        SQLiteDatabase.openDatabase(databaseFile.getPath(), null, SQLiteDatabase.OPEN_READWRITE)) {
      String value = readValue(database, key);
      result.put("value", value == null ? JSONObject.NULL : value);
      call.resolve(result);
    } catch (SQLiteException error) {
      String message = String.valueOf(error.getMessage());
      if (message.contains("no such table")) {
        result.put("value", JSONObject.NULL);
        call.resolve(result);
        return;
      }
      call.reject("Could not read the legacy database: " + message, error);
    }
  }

  private static String readValue(SQLiteDatabase database, String key) {
    long length;
    try (Cursor cursor =
        database.rawQuery(
            "SELECT length(value) FROM redux_store WHERE key = ?", new String[] {key})) {
      if (!cursor.moveToFirst() || cursor.isNull(0)) {
        return null;
      }
      length = cursor.getLong(0);
    }

    StringBuilder value = new StringBuilder((int) length);
    for (long start = 1; start <= length; start += CHUNK_CHARACTERS) {
      try (Cursor cursor =
          database.rawQuery(
              "SELECT substr(value, ?, ?) FROM redux_store WHERE key = ?",
              new String[] {Long.toString(start), Integer.toString(CHUNK_CHARACTERS), key})) {
        if (!cursor.moveToFirst()) {
          throw new SQLiteException("The legacy store changed while it was being read");
        }
        value.append(cursor.getString(0));
      }
    }
    return value.toString();
  }
}
