/* eslint-disable */

const registry = {
  node: {
      person: {
        label: 'Person',
        color: 'coral',
        displayVariable: 'nickname', // Used to tell network canvas which variable to use for the visual representation of the node. Should default to the first variable of type 'text' if not provided.
        variables: {
          name: {
            label: 'Name',
            description: 'Human readable description',
            type: 'text',
            validation: {
              required: true,
              minLength: 1,
              maxLength: 24,
            },
          },
          age: {
            label: 'Age',
            description: 'Human readable description',
            type: 'number',
            validation: {
              required: true,
              minValue: 16,
              maxValue: 100,
            },
          },
          nickname: {
            label: 'Nickname',
            description: 'Human readable description',
            type: 'text',
            validation: {
              required: true,
              minLength: 1,
              maxLength: 8,
            },
          },
          special_category: {
            label: 'Special category',
            description: 'Human readable description',
            type: 'enumerable',
            options: [46],
          },
          some_options: {
            label: 'Some possible options',
            description: 'Human readable description',
            type: 'options',
            options: [46],
            validation: {
              max: 1,
            }
          },
          close_friend: {
            label: 'Close Friend',
            description: 'Human readable description',
            type: 'boolean',
          },
          support_friend: {
            label: 'Support Friend',
            description: 'Human readable description',
            type: 'boolean',
          },
          advice_friend: {
            label: 'Advice Friend',
            description: 'Human readable description',
            type: 'boolean',
          },
          has_given_advice: {
            label: 'Has given advice?',
            description: 'Human readable description',
            type: 'boolean',
          }
        }
      },
      venue: {
        label: 'Venue',
        color: 'kiwi',
        variables: {
          name: {
            label: 'Name',
            description: 'Human readable description',
            type: 'text',
            validation: {
              required: true,
              minLength: 1,
              maxLength: 24,
            },
          },
          location: {
            label: 'Location',
            description: 'Human readable description',
            type: 'coordinates',
          }
        }
      }
  },
  edge: {
      friend: {
        label: 'Friend',
        color: 'mustard',
        variables: {
          contact_freq: {
            label: 'contact_freq',
            description: 'Contact frequency.',
            type: 'ordinal',
            values: {
              "Very Often": 4,
              "Often": 3,
              "Sometimes": 2,
              "Rarely": 1,
              "Never": -1,
            },
          }
        }
      },
      professional: {
        label: 'Professional',
        color: 'kiwi',
        variables: {
        }
      }
  }
};

/*
  * Forms map variables defined in the registry to components.
  * For example, a text variable might be mapped to an input component, and
  * a categorical variable could be mapped to a toggle box, or a checkbox.
*/
const forms = {
  person: { // By default, an interface will look for a form with the same name as the object type.
    title: 'Add A Person',
    fields: [
      {
        variable: 'name', // These variables are assumed to be children of the object type that is being created.
        component: 'TextInput',
      },
      {
        variable: 'nickname',
        component: 'TextInput',
      },
      {
        variable: 'age',
        component: 'TextInput',
      },
      {
        variable: 'timeCreated',
        component: 'hidden',
        value: () => {
          return Date.now().toString(); // This is intended as an example of a hidden field that has a value set when the form is shown. Will this work?
        }
      },
    ]
  },
};


/*
  * The data key holds external data to be used within the app.
*/
const data = {
  "previousInterview": {
    nodes: [
      {
        uid: "previous_1",
        type: "person",
        name: "Anita",
        nickname: "Annie",
        age: "23",
      },
      {
        uid: "previous_2",
        type: "person",
        name: "Barry",
        nickname: "Baz",
        age: "23",
      },
      {
        uid: "previous_3",
        type: "person",
        name: "Carlito",
        nickname: "Carl",
        age: "23",
      },
      {
        uid: "previous_4",
        type: "person",
        name: "Dee",
        nickname: "Dee",
        age: "23",
      },
      {
        uid: "previous_5",
        type: "person",
        name: "Eugine",
        nickname: "Eu",
        age: "23",
      },
    ],
  },
  "venue_list": {
    nodes: [
      {
        type: "venue",
        name: "My Home",
      },
      {
        type: "venue",
        name: "My Workplace",
      },
      {
        type: "venue",
        name: "Local Bar",
      },
    ],
  },
};

const nameGenerator = {
  id: "namegen1",
  type: "NameGenerator",
  label: "NG Closeness",
  creates: 'person',
  form: 'myCustomForm',
  panels: [
    'existing',
  ],
  prompts: [
    {
      id: '6cl',
      text: 'Within the past 6 months, who have you felt particularly close to, or discussed important personal matters with?',
      additionalAttributes: {
        special_category: 46,
        close_friend: true,
      },
    },
    {
      id: '6su',
      text: "Within the past 6 months, who has been supportive?",
      additionalAttributes: {
        support_friend: true,
      },
    },
    {
      id: '2we',
      text: "Within the past 2 weeks, who has provided advice?",
      additionalAttributes: {
        advice_friend: true,
      },
    },
  ],
};

const sociogram = {
  id: "sociogram",
  type: "Sociogram",
  label: "Sociogram",
  prompts: [
    {
      id: 'closeness1',
      text: 'Position the nodes amongst the concentric circles. Place people you are closer to towards the middle',
      nodeType: 'person',
      filter: (nodes) => {
        // filter nodes by these criteria.
      },
      layout: {
        layoutVariable: 'closenessLayout',
        allowPositioning: true,
      },
      edges: {
        display: ['friends', 'professional'],
        create: 'friends',
      },
      highlight: {
        variable: 'has_given_advice',
        value: true,
        allowHighlighting: true,
      },
      disable: (nodes) => {
        // put nodes matched here into the disabled state.
      },
      nodeBinSortOrder: {
        'nickname': 'DESC',
      },
      background: {
        concentricCircles: 4,
        skewedTowardCenter: true,
      },
    },
  ],
};

export default {
  name: "Demo Protocol",
  version: "1.0.0",
  networkCanvasVersion: "~4.0.0",
  variableRegistry: registry,
  externalData: data,
  forms: forms,
  stages: [ nameGenerator, sociogram],
};
