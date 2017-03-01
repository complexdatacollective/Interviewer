export default class Network {
  constructor() {
    this.network = {};
  }

  getSampleProtocol() {
    return {
      "name": "My first interview protocol",
      "version": "1.2.3",
      "required": "1.2.4",
      "stages": [
        {
          "type": "namegenerator",
          "title": "Name Generator One",
          "params": {
            "prompt": "Who are your best friends?"
          },
          "skipFunc": {}
        },
        {
          "type": "namegenerator",
          "title": "Name Generator Two",
          "params": {
            "prompt": "Who did you go to school with?"
          },
          "skipFunc": {}
        },
        {
          "type": "sociogram",
          "title": "Fun Sociogram",
          "params": {
            "prompt": "Put people somewhere within these circles"
          },
          "skipFunc": {}
        }
      ]
    }
  }
}
