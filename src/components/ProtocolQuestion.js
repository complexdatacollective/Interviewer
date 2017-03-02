import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { NameGeneratorForm } from '../containers/Forms';

class ProtocolQuestion extends Component {
  render() {
    const {
      label,
      name,
      skip
    } = this.props.question;

    if (this.props.protocolForm && this.props.protocolForm.values) {
      // for (let key in this.props.protocolForm.values) {
      //   // parse the key
      //   console.log('skip', eval(skip));
      // }

      var generateTemplateString = (function(){
          var cache = {};

          function generateTemplate(template){

          var fn = cache[template];

          if (!fn){

          // Replace ${expressions} (etc) with ${map.expressions}.

          var sanitized = template
              .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, function(_, match){
                  return `\$\{map.${match.trim()}\}`;
                  })
              // Afterwards, replace anything that's not ${map.expressions}' (etc) with a blank string.
              .replace(/(\$\{(?!map\.)[^}]+\})/g, '');

          fn = Function('map', `return \`${sanitized}\``);

          }

          return fn;
      };

      return generateTemplate;
      })();

      var kingMaker = generateTemplateString(eval(skip));
      console.log(kingMaker(this.props.protocolForm.values));

    }

    return (
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          {label}
        </div>
        <div className='grid__item grid--p-small'>
          <NameGeneratorForm
            fieldName={name} />
        </div>
      </div>
    );
  }
}

ProtocolQuestion.propTypes = {
  question: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
    protocol: state.protocol,
    protocolForm: state.form.protocolForm
  }
}

export default connect(mapStateToProps)(ProtocolQuestion);
