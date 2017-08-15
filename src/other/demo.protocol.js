/* eslint-disable */

const data = {
  "previous": {
    nodes: [
      {
        uid: "previous_1",
        type: "person",
        name: "Anita",
        nickname: "Annie",
      },
      {
        uid: "previous_2",
        type: "person",
        name: "Barry",
        nickname: "Baz",
      },
      {
        uid: "previous_3",
        type: "person",
        name: "Carlito",
        nickname: "Carl",
      },
      {
        uid: "previous_4",
        type: "person",
        name: "Dee",
        nickname: "Dee",
      },
      {
        uid: "previous_5",
        type: "person",
        name: "Eugine",
        nickname: "Eu",
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
      minLength: 2,
    }
  },
  {
    label: 'Nickname',
    name: 'nickname',
    type: 'Alphanumeric',
    placeholder: 'Nickname',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 8,
    },
  },
];

export default {
  config: {
    "name": "My first interview protocol",
    "version": "1.2.3",
    "required": "1.2.4",
    "exportPath": "some/path/here.json",
    "data": data,
    "stages": [
      {
        "id": "sociogram",
        "type": "Sociogram",
        "icon": "menu-sociogram",
        "title": "Sociogram",
        "params": {
          "nodeType": 'person',
          "prompts": [
            {
              id: '67cl1',
              title: 'Within the past 6 months, who have you felt close to?',
              layout: 'closenessLayout',
              background: {
                n: 3,
                skewed: true,
              },
              sort: {
                by: 'nickname',
              },
            },
            {
              id: '67su2',
              title: "Within the past 6 months, who has been supportive?",
              layout: 'closenessLayout',
              edgeAttributes: {
                supports: true,
              },
              canDrag: false,
              background: {
                n: 3,
                skewed: true,
              },
              sort: {
                by: 'nickname',
                order: 'DESC',
              },
            },
            {
              id: '67su3',
              title: "Within the past 6 months, who has been supportive?",
              layout: 'closenessLayout',
              nodeAttributes: {
                travel_friend: true,
              },
              canDrag: false,
              background: {
                n: 3,
                skewed: true,
              },
              sort: {
                by: 'nickname',
                order: 'DESC',
              },
            },
            {
              id: '67su4',
              title: "Within the past 6 months, who has been supportive?",
              layout: 'supportiveLayout',
              background: {
                image: 'https://upload.wikimedia.org/wikipedia/commons/5/52/US_map_-_states.png',
              },
              sort: {
                by: 'nickname',
                order: 'DESC',
              },
            },
          ],
        },
      },
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
              title: "Within the past 2 weeks, who has visited",
              nodeAttributes: {
                travel_friend: true,
              },
            },
          ],
          form: {
            title: 'Answer some questions',
            name: 'quiz1',
            fields: fields,
            autoPopulate: (fields, values, populate) => {
              if(!fields['nickname'] || !fields['nickname'].touched) {
                populate('nickname', values['name'].split(' ')[0]);
              }
            },
          },
        },
      },
      {
        "id": "namegen2",
        "type": "NameGenerator",
        "icon": "menu-name-generator",
        "title": "Name Generator Title 2",
        "params": {
          "nodeType": 'person',
          "prompts": [
            {
              id: '5be',
              title: "Within the past 6 months, what's the best person you've seen ever?",
              nodeAttributes: {
                fun_times: true,
              },
            },
          ],
          form: {
            title: 'Answer some questions',
            name: 'quiz2',
            fields: fields,
            autoPopulate: (fields, values, populate) => {
              if(!fields['nickname'] || !fields['nickname'].touched) {
                populate('nickname', values['name'].split(' ')[0]);
              }
            },
          },
          "panels": [
            'existing',
          ],
        },
      },
    ],
  },
};
