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
          "title": "Name Generator Title",
          "params": {
            "panels": [
              {
                "title": "Exiting nodes",
                "filter": 'existing',
              },
              {
                "title": "Custom nodes",
                "filter": 'previous',
              },
            ],
            "prompts": [
              {
                title: 'Within the past 6 months, who have you felt close to?',
                nodeAttributes: [
                  {
                    label: 'special_category',
                    value: 46
                  },
                  {
                    label: 'close_friend',
                    value: true
                  }
                ]
              },
              {
                title: "Within the past 6 months, who has been supportive?",
                nodeAttributes: [
                  {
                    label: 'support_friend',
                    value: true
                  }
                ]
              },
              {
                title: "Within the past 2 weeks, who has visited",
                nodeAttributes: [
                  {
                    label: 'travel_friend',
                    value: true
                  }
                ]
              }
            ],
            form: {
              title: 'Add a person you know',
              formName: 'closeFriends',
              fields: [
                {
                  label: 'Name',
                  name: 'name',
                  type: 'text',
                  placeholder: 'Name',
                  required: true
                },
                {
                  label: 'Nickname',
                  name: 'nickname',
                  type: 'text',
                  placeholder: 'Nickname',
                  required: true
                }
              ]
            },
          },
        },
        {
          "type": "namegenerator",
          "title": "Name Generator Title",
          "params": {
            "prompts": [
              {
                title: "Within the past 6 months, what's the best thing you've seen ever?",
                nodeAttributes: [
                  {
                    label: 'fun_times',
                    value: true
                  }
                ]
              }
            ],
            form: {
              title: "Add a thing you've seen",
              formName: 'bestThings',
              fields: [
                {
                  label: 'Thing',
                  name: 'thing',
                  type: 'text',
                  placeholder: 'Name',
                  required: true
                }
              ]
            },
            "panels": [
              {
                "title": "Exiting nodes",
                "filter": 'existing',
              },
            ],
          },
        }
      ]
    }
  }
}
