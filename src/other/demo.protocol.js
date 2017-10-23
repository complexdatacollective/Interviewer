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
      }
  }
};

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

export default {
  name: "Demo Protocol",
  version: "1.0.0",
  networkCanvasVersion: "~4.0.0",
  variableRegistry: registry,
  externalData: data,
  forms: forms,
  stages: [ nameGenerator,
    {
      id: "sociogram",
      type: "Sociogram",
      label: "Sociogram",
      nodeType: 'person',
      prompts: [
        {
          id: 'closeness1',
          title: 'Position the nodes amongst the concentric circles. Place people you are closer to towards the middle',
          sociogram: {
            edge: {
              type: 'friends',
            },
            layout: 'closenessLayout',
            background: {
              n: 4,
              skewed: true,
            },
            position: true,
          },
        },
        {
          id: 'closeness2',
          title: "Connect any two people who are friends, or who would spend time together without you being there.",
          sociogram: {
            layout: 'closenessLayout',
            edge: {
              type: 'friends',
            },
            background: {
              n: 4,
              skewed: true,
            },
            select: {
              action: 'EDGE',
            },
            sort: {
              by: 'nickname',
              order: 'DESC',
            },
          },
        },
        {
          id: 'closeness3',
          title: "Tap on anyone who has given you advice within the past 6 months.",
          sociogram: {
            layout: 'closenessLayout',
            edge: {
              type: 'friends',
            },
            nodeAttributes: {
              has_given_advice: true,
            },
            background: {
              n: 4,
              skewed: true,
            },
            position: false,
            select: {
              action: 'ATTRIBUTES',
            },
            sort: {
              by: 'nickname',
              order: 'DESC',
            },
          },
        },
        {
          id: 'closeness5',
          title: "Connect any two people who are work together professionally.",
          sociogram: {
            layout: 'closenessLayout',
            edge: {
              type: 'professional',
              color: 'edge-alt-3',
            },
            background: {
              n: 4,
              skewed: true,
            },
            position: true,
            select: {
              action: 'EDGE',
            }
          },
        },
        {
          id: 'closeness4',
          title: "Position people on the map",
          sociogram: {
            layout: 'geographicLayout',
            edge: {
              type: 'family',
              color: 'edge-alt-3',
            },
            background: {
              image: 'map.svg',
            },
            position: true,
            sort: {
              by: 'nickname',
              order: 'DESC',
            },
          },
        },
      ],
    },
  ],
};
