export type InputControlDefinition = {
  label: string;
  description: string;
  image?: string;
};

export enum InputComponents {
  Text = 'Text',
  TextArea = 'TextArea',
  Number = 'Number',
  CheckboxGroup = 'CheckboxGroup',
  Toggle = 'Toggle',
  RadioGroup = 'RadioGroup',
  ToggleButtonGroup = 'ToggleButtonGroup',
  LikertScale = 'LikertScale',
  VisualAnalogScale = 'VisualAnalogScale',
  DatePicker = 'DatePicker',
  RelativeDatePicker = 'RelativeDatePicker',
  BooleanChoice = 'BooleanChoice',
}

export const textInput = {
  label: 'Text Input',
  description: 'This is a standard text input, allowing for simple data entry up to approximately 30 characters.',
  // Reinstate: image: TextInputImage,
};

export const textArea = {
  label: 'Text Area',
  description: 'This is an extra large text input, allowing for simple data entry for more than 30 characters.',
  // Reinstate: image: TextAreaImage,
};

export const numberInput = {
  label: 'Number Input',
  description: 'This input is optimized for collecting numerical data, and will show a number pad if available.',
  // Reinstate: image: NumberInputImage,
};

export const checkboxGroup = {
  label: 'Checkbox Group',
  description: 'This component provides a group of checkboxes so that multiple values can be toggled on or off.',
  // Reinstate: image: CheckboxGroupImage,
};

export const toggle = {
  label: 'Toggle',
  description: 'This component renders a switch, which can be tapped or clicked to indicate "on" or "off". By default it is in the "off" position. If you require a boolean input without a default, use the BooleanChoice component',
  // Reinstate: image: ToggleImage,
};

export const radioGroup = {
  label: 'Radio Group',
  description: 'This component renders a group of options and allow the user to choose one.',
  // Reinstate: image: RadioGroupImage,
};

export const toggleButtonGroup = {
  label: 'Toggle Button Group',
  description: 'This component provides a colorful button that can be toggled "on" or "off". It is an alternative to the Checkbox Group, and allows multiple selection by default.',
  // Reinstate: image: ToggleButtonGroupImage,
};

export const likertScale = {
  label: 'LikertScale',
  description: 'A component providing a likert-type scale in the form of a slider. Values are derived from the option properties of this variable, with labels for each option label.',
  // Reinstate: image: LikertScaleImage,
};

export const visualAnalogScale = {
  label: 'VisualAnalogScale',
  description: 'A Visual Analog Scale (VAS) component, which sets a normalized value between 0 and 1 representing the position of the slider between each end of the scale.',
  // Reinstate: image: VisualAnalogScaleImage,
};

export const datePicker = {
  label: 'DatePicker',
  description: 'A calendar date picker that allows a respondent to quickly enter year, month, and day data.',
  // Reinstate: image: DatePickerImage,
};

export const relativeDatePicker = {
  label: 'RelativeDatePicker',
  description: 'A calendar date picker that automatically limits available dates relative to an "anchor date", which can be configured to the date of the interview session. ',
  // Reinstate: image: RelativeDatePickerImage,
};

export const booleanChoice = {
  label: 'BooleanChoice',
  description: 'A component for boolean variables that requires the participant to actively select an option. Unlike the toggle component, this component accepts the "required" validation.',
  // Reinstate: image: BooleanChoiceImage,
};

const inputControls = {
  textInput,
  textArea,
  numberInput,
  checkboxGroup,
  toggle,
  radioGroup,
  toggleButtonGroup,
  likertScale,
  visualAnalogScale,
  datePicker,
  relativeDatePicker,
  booleanChoice,
};

export default inputControls;
