/**
 * Validates protocol data.
 *
 * @extends Component
 * @module ProtocolService
 */
export default class ProtocolService {
  constructor() {
    this.protocol = {};
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
      "data": {
        "previous": {
          nodes: [
            {
              uid: "previous_1",
              type: "person",
              name: "Fred",
              nickname: "Foo",
            },
            {
              uid: "previous_2",
              type: "person",
              name: "Bob",
              nickname: "Bar",
            },
            {
              uid: "previous_3",
              type: "person",
              name: "Barry",
              nickname: "Baz",
            }
          ],
        },
        "foodNetwork": {
          nodes: [
            {
              type: "food",
              subType: "vegetable",
              name: "tomato",
            },
            {
              type: "food",
              subType: "fruit",
              name: "lime",
            },
            {
              type: "food",
              subType: "fruit",
              name: "bluefruit",
            }
          ],
        }
      },
      "stages": [
        {
          "id": "namegen1",
          "type": "namegenerator",
          "title": "Name Generator Title 1",
          "params": {
            "nodeType": 'person',
            "panels": [
              'existing',
              'previous',
            ],
            "prompts": [
              {
                id: '6cl',
                title: 'Within the past 6 months, who have you felt close to?',
                nodeAttributes: {
                  special_category: 46,
                  close_friend: true,
                }
              },
              {
                id: '6su',
                title: "Within the past 6 months, who has been supportive?",
                nodeAttributes: {
                  support_friend: true,
                }
              },
              {
                id: '2we',
                title: "Within the past 2 weeks, who has visited",
                nodeAttributes: {
                  travel_friend: true,
                }
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
          "id": "namegen2",
          "type": "namegenerator",
          "title": "Name Generator Title 2",
          "params": {
            "nodeType": 'person',
            "prompts": [
              {
                id: '5be',
                title: "Within the past 6 months, what's the best person you've seen ever?",
                nodeAttributes: {
                  fun_times: true
                }
              }
            ],
            form: {
              title: "Add a person you've seen",
              formName: 'bestPeople',
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
            "panels": [
              'existing',
              'previous',
            ],
          },
        }
      ]
    }
  }
}
