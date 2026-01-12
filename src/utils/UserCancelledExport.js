class UserCancelledExport extends Error {
  constructor(message = 'User cancelled export') {
    super(message);
    this.name = 'UserCancelledExport';
  }
}

export default UserCancelledExport;
