import Capacitor
import Foundation
import SQLite3

/// Reads the redux store the Cordova builds of Interviewer (6.5.x and earlier)
/// persisted with cordova-sqlite-storage, so the web layer can migrate it into
/// IndexedDB (src/utils/legacyCordovaMigration.js). Read only: the old
/// database is never changed.
///
/// cordova-sqlite-storage's `location: 'default'` is Library/LocalDatabase on
/// iOS; the app opened `redux-store-db` and kept one table, `redux_store (key, value)`.
@objc(LegacyCordovaDataPlugin)
public class LegacyCordovaDataPlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "LegacyCordovaDataPlugin"
  public let jsName = "LegacyCordovaData"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "readState", returnType: CAPPluginReturnPromise)
  ]

  private static let sqliteTransient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

  /// Resolves `{ exists: false }` when there is no legacy database, otherwise
  /// `{ exists: true, value }` where value is the stored string for `key`, or
  /// null when the table or row is missing.
  @objc func readState(_ call: CAPPluginCall) {
    guard let key = call.getString("key") else {
      call.reject("key is required")
      return
    }

    let library = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask)[0]
    let databasePath = library.appendingPathComponent("LocalDatabase/redux-store-db").path

    guard FileManager.default.fileExists(atPath: databasePath) else {
      call.resolve(["exists": false])
      return
    }

    // Read-write without CREATE so SQLite can roll back a hot journal left by
    // an interrupted write; only a SELECT is run.
    var database: OpaquePointer?
    guard sqlite3_open_v2(databasePath, &database, SQLITE_OPEN_READWRITE, nil) == SQLITE_OK else {
      let message = database.map { String(cString: sqlite3_errmsg($0)) } ?? "unknown error"
      sqlite3_close(database)
      call.reject("Could not open the legacy database: \(message)")
      return
    }
    defer { sqlite3_close(database) }

    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(database, "SELECT value FROM redux_store WHERE key = ?", -1, &statement, nil) == SQLITE_OK else {
      let message = String(cString: sqlite3_errmsg(database))
      if message.contains("no such table") {
        call.resolve(["exists": true, "value": NSNull()])
      } else {
        call.reject("Could not query the legacy database: \(message)")
      }
      return
    }
    defer { sqlite3_finalize(statement) }

    sqlite3_bind_text(statement, 1, key, -1, LegacyCordovaDataPlugin.sqliteTransient)

    switch sqlite3_step(statement) {
    case SQLITE_ROW:
      guard let text = sqlite3_column_text(statement, 0) else {
        call.resolve(["exists": true, "value": NSNull()])
        return
      }
      let length = Int(sqlite3_column_bytes(statement, 0))
      let value = String(decoding: UnsafeBufferPointer(start: text, count: length), as: UTF8.self)
      call.resolve(["exists": true, "value": value])
    case SQLITE_DONE:
      call.resolve(["exists": true, "value": NSNull()])
    default:
      call.reject("Could not read the legacy database: \(String(cString: sqlite3_errmsg(database)))")
    }
  }
}
