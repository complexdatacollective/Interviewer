/* eslint-disable */

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

return {
  config: {
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
    },
    "stages": [
      {
        "id": "namegen1",
        "type": "NameGenerator",
        "title": "Name Generator Title",
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
        "title": "Name Generator Title",
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
