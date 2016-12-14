module.exports = class NCNode {

  constructor(name) {
      this._name = name;
      this.edges = [];
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

};
