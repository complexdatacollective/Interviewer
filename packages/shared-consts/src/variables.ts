import { InputControlDefinition } from './controls/index.js';

// This isn't working currently
export enum VariableType {
  boolean = "boolean",
  text = "text",
  number = "number",
  datetime = "datetime",
  ordinal = "ordinal",
  scalar = "scalar",
  categorical = "categorical",
  layout = "layout",
  location = "location",
}

export type OptionsOption = {
  label: string;
  value: string | number | boolean;
};

export type VariableValidation = {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  unique?: boolean;
  sameAs?: string;
  differentFrom?: string;
  greaterThanVariable?: string;
  lessThanVariable?: string;
};

export type VariableDefinition = {
  name: string;
  type: string;
  component?: string;
  validation?: VariableValidation;
  options?: OptionsOption[];
  parameters?: {
    minLabel?: string;
    maxLabel?: string;
    before?: number;
    type?: string; // Todo: map out possible values for this
    min?: string;
  }
};