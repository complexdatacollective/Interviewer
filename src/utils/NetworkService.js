export default class Network {
  constructor() {
    this.network = {};
  }

  getSampleProtocol() {
    return {
      "name": "My first interview protocol",
      "version": "1.2.3",
      "required": "1.2.4",
      "exportPath": "some/path/here.json",
      "stages": [
        {
          "type": "namegenerator",
          "title": "Name Generator One",
          "params": {
            "questions": [
              {
                "label": "Who are your best friends?",
                "name": "bestFriends",
                "multiple": "true",
                "skip": {}
              }
            ]
          },
          "skip": {}
        },
        {
          "type": "namegenerator",
          "title": "Name Generator Two",
          "params": {
            "questions": [
              {
                "label": "Who did you go to school with?",
                "name": "school",
                "multiple": "true",
                "skip": {}
              },
              {
                "label": "Who was your best friend at school?",
                "name": "bestFriendsSchool",
                "multiple": "true",
                "skip": "${!bestFriends}"
              }
            ]
          },
          "skip": {}
        },
        {
          "type": "sociogram",
          "title": "Fun Sociogram",
          "params": {
            "questions": [
              {
                "label": "Are you having fun?",
                "name": "fun",
                "skip": {}
              }
            ]
          },
          "skip": {}
        }
      ]
    }
  }
}
