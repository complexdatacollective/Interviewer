let namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

module.exports = class Network {

  constructor() {
      this._edges = [];
      this._nodes = [];
      this.reserved_ids = [];
  }

  addNode(properties) {

    if (!this.egoExists()) {
      throw new Error('You must add an Ego before attempting to add other nodes.');
    }

    let newNodeID = 0;

    while (this.getNode(newNodeID) !== false || this.reserved_ids.indexOf(newNodeID) !== -1) {
      newNodeID++;
    }

    let nodeProperties = {
      id: newNodeID
    };

    Object.assign(nodeProperties, properties); // ES6 approach to extending objects.

    this.nodes.push(nodeProperties);
    this.reserved_ids.push(newNodeID);
  }

  egoExists() {
    return true;
  }

  resetNetwork() {
    this.nodes = [];
    this.edges = [];
  }

  getNode(id) {
    // Ensure that ID is always treated as int for === comparisons to work reliably.
    id = parseInt(id);

    if (id === undefined) { return false; }
    for (var i = 0;i<this._nodes.length; i++) {
      if (this._nodes[i].id === id) {return this._nodes[i]; }
    }
    return false;

  }

  get nodes() {
    return this._nodes;
  }

};
