export default class ProtocolService {
  constructor() {
    this.protocol = {}
  }

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
            "prompts": [
              {
                title: 'Within the past 6 months, who have you felt close to?',
                variables: [
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
                title: "Within the past 6 months, what's the best thing you've seen ever?",
                variables: [
                  {
                    label: 'fun_times',
                    value: true
                  }
                ]
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
