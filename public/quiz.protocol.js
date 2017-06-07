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
      minLength: 8,
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
  {
    label: 'Age',
    name: 'age',
    type: 'Numeric',
    validation: {
      required: true,
      minValue: 0,
      maxValue: 200,
    },
  },
  {
    label: 'Which are your favourite package managers? (checkbox list)',
    name: 'favourite_package_manager',
    type: 'CheckboxGroup',
    options: ['yarn', 'npm', 'pip', 'gem', 'pear'],
    validation: {
      minSelected: 1,
    },
  },
  {
    label: 'Pick something from the network? (with selector)',
    name: 'network_picker',
    type: 'CheckboxGroup',
    optionsSelector: (state) => (
      state.network.nodes.map((node) => (node.name))
    ),
    validation: {
    },
  },
  {
    label: 'Which package managers have you used? (no validations)',
    name: 'used_package_managers',
    type: 'CheckboxGroup',
    options: ['yarn', 'npm', 'pip', 'gem', 'pear'],
    validation: {

    },
  },
  {
    label: 'Pick one. (radio group)',
    name: 'pick_opne',
    type: 'RadioGroup',
    options: ['yarn', 'npm', 'pip', 'gem', 'pear'],
    validation: {
    },
  },
  {
    label: 'Which package managers have you contributed to? (toggle group)',
    name: 'contributed_package_managers',
    type: 'ToggleGroup',
    options: ['yarn', 'npm', 'pip', 'gem', 'pear'],
    colors: ['red', 'green', 'blue', 'yellow', 'pink'],
    validation: {
    },
  },
];

return {
  config: {
    "name": "My first interview protocol",
    "version": "1.2.3",
    "required": "1.2.4",
    "exportPath": "some/path/here.json",
    "stages": [
      {
        "id": "quiz1",
        "type": "quiz",
        "title": "Quiz",
        "params": {
          "prompts": [
            {
              id: '6qz',
              title: 'Huge quize',
              nodeAttributes: {},
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
    ],
  },
};
