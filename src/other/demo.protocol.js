/* eslint-disable */

const variableRegistry = {
  name: {
    label: 'Name',
    type: 'text',
    rules: {
      required: true,
      length: 10,
    },
  },
  age: {
    label: 'age',
    type: 'number',
    rules: {
      required: true,
      min: 18,
      max: 122,
    },
  },
  nickname: {
    label: 'Nickname',
    type: 'text',
    rules: {
      required: true,
      length: 10,
    },
  },
  special_category: {
    label: 'Special category',
    type: 'enumerable',
    options: [46],
  },
  some_options: {
    label: 'Some possible options',
    type: 'options',
    options: [46],
    rules: {
      max: 1,
    }
  },
  close_friend: {
    label: 'Close Friend',
    type: 'boolean',
  },
  support_friend: {
    label: 'Support Friend',
    type: 'boolean',
  },
  advice_friend: {
    label: 'Advice Friend',
    type: 'boolean',
  },
  has_given_advice: {
    label: 'Has given advice?',
    type: 'boolean',
  }
};

const data = {
  "previous": {
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
      },
    ],
  },
};

const fields = [
  {
    label: 'Name',
    name: 'name',
    type: 'Alphanumeric',
    placeholder: 'Name',
    validation: {
      required: true,
      minLength: 1,
      maxLength: 24,
    }
  },
  {
    label: 'Nickname',
    name: 'nickname',
    type: 'Alphanumeric',
    placeholder: 'Nickname',
    validation: {
      required: true,
      minLength: 1,
      maxLength: 8,
    },
  },
  {
    label: 'Age',
    name: 'age',
    type: 'Alphanumeric',
    isNumericOnly: true,
    validation: {
      required: true,
      minValue: 16,
      maxValue: 100,
    },
  },
];

let generateNickname = (name) => {
  if (name) {
    const nickName = name.split(' ')[0]+(name.split(' ')[1] ? ' ' + name.split(' ')[1][0] : '');
    return nickName.substring(0,8);
  } else {
    return '';
  }

}

export default {
  config: {
    "name": "Demo Protocol",
    "version": "1.0.0",
    "required": "1.0.0",
    "exportPath": "some/path/here.json",
    "data": data,
    "stages": [
      {
        "id": "namegen1",
        "type": "NameGenerator",
        "icon": "menu-name-generator",
        "title": "Closeness",
        "params": {
          "nodeType": 'person',
          "panels": [
            'existing',
            'previous',
          ],
          "prompts": [
            {
              id: '6cl',
              title: 'Within the past 6 months, who have you felt particularly close to, or discussed important personal matters with?',
              nodeAttributes: {
                special_category: 46,
                close_friend: true,
              },
            },
            {
              id: '6su',
              title: "Within the past 6 months, who has been supportive?",
              nodeAttributes: {
                support_friend: true,
              },
            },
            {
              id: '2we',
              title: "Within the past 2 weeks, who has provided advice?",
              nodeAttributes: {
                advice_friend: true,
              },
            },
          ],
          form: {
            title: 'Add A Person',
            name: 'name-generator-form',
            fields: fields,
            autoPopulate: (fields, values, populate) => {
              if((!fields['nickname'] || !fields['nickname'].touched) && values) {
                populate('nickname', generateNickname(values['name']));
              }
            },
          },
        },
      },
      {
        "id": "sociogram",
        "type": "Sociogram",
        "icon": "menu-sociogram",
        "title": "Sociogram",
        "params": {
          "nodeType": 'person',
          "prompts": [
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
      },
    ],
  },
};
