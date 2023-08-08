import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ActionButton, Button, Scroller } from '@codaco/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import Overlay from './Overlay';
import Form from './Form';
import FormWizard from './FormWizard';
import { FIRST_LOAD_UI_ELEMENT_DELAY } from './Interfaces/utils/constants';

const reduxFormName = 'NODE_FORM';

const NodeForm = (props) => {
  const {
    subject,
    selectedNode,
    form,
    disabled,
    icon,
    nodeType,
    addNode,
    newNodeModelData,
    newNodeAttributes,
    onClose,
  } = props;

  const useFullScreenForms = useSelector((state) => state.deviceSettings.useFullScreenForms);

  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isValid && !disabled) {
      addNode(
        newNodeModelData,
        {
          ...newNodeAttributeData,
          [targetVariable]: nodeLabel,
        },
      );

      setNodeLabel('');
    }
  };

  // When a selected node is passed in, we are editing an existing node.
  // We need to show the form and populate it with the node's data.
  useEffect(() => {
    if (selectedNode) {
      setShow(true);
    }
  }, [selectedNode]);

  const FormComponent = useMemo(() => {
    if (useFullScreenForms) {
      return FormWizard;
    }

    return (formProps) => (<Scroller><Form {...formProps} /></Scroller>);
  }, [useFullScreenForms]);

  console.log('form', form, selectedNode);

  const handleClose = () => {
    console.log('handleClose');
    setShow(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="name-generator-interface__add-button"
          initial={{
            opacity: 0,
            y: '100%',
          }}
          animate={{
            opacity: 1,
            y: '0rem',
            transition: {
              delay: FIRST_LOAD_UI_ELEMENT_DELAY,
            },
          }}
        >
          <ActionButton
            disabled={disabled}
            onClick={() => setShow(true)}
            icon={icon}
            title={`Add ${nodeType}...`}
          />
        </motion.div>
      </AnimatePresence>
      <Overlay
        show={show}
        title={form.title}
        onClose={handleClose}
        className="node-form"
        forceEnableFullscreen={useFullScreenForms}
        footer={!useFullScreenForms && (<Button key="submit" aria-label="Submit" type="submit" onClick={handleSubmit}>Finished</Button>)}
        allowMaximize={false}
      >
        <FormComponent
          {...form}
          subject={subject}
          initialValues={selectedNode?.[entityAttributesProperty]}
          onSubmit={addNode}
          autoFocus
          form={reduxFormName}
          validationMeta={{
            entityId: selectedNode?.[entityPrimaryKeyProperty],
          }}
        // otherNetworkEntities,
        />
      </Overlay>
    </>
  );
};

export default NodeForm;
