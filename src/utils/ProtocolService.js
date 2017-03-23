/**
 * Validates protocol data.
 *
 * @extends Component
 * @module ProtocolService
 */
export default class ProtocolService {
  constructor() {
    this.protocol = {}
  }

  /**
   * Evaluates skip logic
   *
   * @param {string} cond - Condition
   * @param {string} formVarStr - Form variable string
   * @returns {string} Sanitized string
   *
   */
  evaluateSkipLogic(cond, formVarStr) {
    if (typeof formVarStr !== 'string') {
      return;
    }
    const sanitized = cond.replace(/\{\{([\s]*[^;\s]+[\s]*)\}\}/g, (stringGroup, match) => {
      return  `$\{${formVarStr}.${match.trim()}}`;
    })
    // re-add the other operations
    .replace(`/($\{(?!${formVarStr}.)[^}]+})/g`, '');
    console.log('san', `\`${sanitized}\``)
    return `\`${sanitized}\``;
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
                "skip": "{{bestFriends}}.length > 5"
              },
              {
                "label": "Who was your best friend at school?",
                "name": "bestFriendsSchool",
                "multiple": "true",
                "skip": "!{{bestFriends}}"
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
