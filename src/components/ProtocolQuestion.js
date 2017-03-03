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
      // TODO - skip logic using templating strings
      if (skip) {
        // // match the variable name in the parenthesis
        // const regEx = /\$\{([\s]*[^;\s\{]+[\s]*)\}/g;
        // const match = regEx.exec(skip);

        // if (match !== null) {
        //   console.log(match[1]);
        //   console.log(this.props.protocolForm.values[match[1]]);
        // }

        var generateTemplateString = (function(){
            var cache = {};

            function generateTemplate(template){

            var fn = cache[template];

            if (!fn){

            // Replace ${expressions} (etc) with ${map.expressions}.

            var sanitized = template
                .replace(/\$\{([\s]*[^;\s]+[\s]*)\}/g, function(_, match){
                    return `\$\{map.${match.trim()}\}`;
                    })
                // Afterwards, replace anything that's not ${map.expressions}' (etc) with a blank string.
                .replace(/(\$\{(?!map\.)[^}]+\})/g, '');
            console.log(sanitized);
            fn = Function('map', `return \`'${sanitized}'\``);

            }

            return fn;
        };

        return generateTemplate;
        })();

        var formTemplate = generateTemplateString(skip);

        console.log(formTemplate(this.props.protocolForm.values));
      }


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
