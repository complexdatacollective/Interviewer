class UserCancelledExport extends Error {
  constructor() {
    super();
    this.name = 'UserCancelledExport';
    this.message = 'The user cancelled the export process.';
  }
}

module.exports = UserCancelledExport;
