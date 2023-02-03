/* eslint-env jest */

class DragManager {
  static options = {};

  static unmount = jest.fn();

  static setOptions(options) {
    DragManager.options = options;
  }

  static getOptions() {
    return DragManager.options;
  }

  constructor(options) {
    DragManager.setOptions(options);
  }

  unmount = () => {
    DragManager.unmount();
  }
}

export default DragManager;
