export default class ProtocolService {
  constructor() {
    this.protocol = {}
  }

  evaluateSkipLogic(cond, formObject) {
    if (typeof formObject !== 'object') {
      return;
    }
    // skip: ${bestFriends}.length > 5
    const sanitized = cond.replace(/\$\{([\s]*[^;\s]+[\s]*)\}/g, (stringGroup, match) => {
      // if form has a value for bestFriends, we get `bestFriendsValue`.length > 5
      // else false as a hard boolean
      const replaceStr = formObject[match] ? formObject[match] : false;
      return `\`${replaceStr}\``;
    })
    // re-add the other operations
    .replace(`/(\$\{(?!${formObject}\.)[^}]+\})/g`, '');
    return sanitized;
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
                "skip": ""
              }
            ]
          },
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
                "skip": "${bestFriends}.length > 5"
              },
              {
                "label": "Who was your best friend at school?",
                "name": "bestFriendsSchool",
                "multiple": "true",
                "skip": "!${bestFriends}"
              }
            ]
          },
        },
        {
          "type": "sociogram",
          "title": "Fun Sociogram",
          "params": {
            "questions": [
              {
                "label": "Are you having fun?",
                "name": "fun",
                "skip": ""
              }
            ]
          },
        }
      ]
    }
  }
}
