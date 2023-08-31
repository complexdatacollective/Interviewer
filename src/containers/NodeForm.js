import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submit } from 'redux-form';
import { ActionButton, Button, Scroller } from '@codaco/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
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
    newNodeModelData,
    newNodeAttributes,
    onClose,
  } = props;

  const [show, setShow] = useState(false);

  const dispatch = useDispatch();
  const submitForm = () => dispatch(submit(reduxFormName));
  const addNode = (...properties) => dispatch(sessionsActions.addNode(...properties));
  const updateNode = (...properties) => dispatch(sessionsActions.updateNode(...properties));

  const useFullScreenForms = useSelector((state) => state.deviceSettings.useFullScreenForms);

  const handleSubmit = useCallback((formData) => {
    if (!selectedNode) {
      /**
      *  addNode(modelData, attributeData);
      */
      addNode(
        newNodeModelData,
        { ...newNodeAttributes, ...formData },
      );
    } else {
      /**
      * updateNode(nodeId, newModelData, newAttributeData)
      */
      const selectedUID = selectedNode[entityPrimaryKeyProperty];
      updateNode(selectedUID, {}, formData);
    }

    setShow(false);
    onClose();
  }, [selectedNode, newNodeModelData, newNodeAttributes, onClose]);

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

  const handleClose = useCallback(() => {
    setShow(false);
    onClose();
  }, [onClose]);

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
        footer={!useFullScreenForms && (<Button key="submit" aria-label="Submit" type="submit" onClick={submitForm}>Finished</Button>)}
        allowMaximize={false}
      >
        <FormComponent
          {...form}
          subject={subject}
          initialValues={selectedNode?.[entityAttributesProperty]}
          onSubmit={handleSubmit}
          autoFocus
          form={reduxFormName}
          validationMeta={{
            entityId: selectedNode?.[entityPrimaryKeyProperty],
          }}
        />
      </Overlay>
    </>
  );
};

export default NodeForm;
