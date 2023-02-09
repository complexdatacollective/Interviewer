import { Color } from "./colors.js";

export enum StageTypes {
  NameGenerator = 'NameGenerator',
  NameGeneratorQuickAdd = 'NameGeneratorQuickAdd',
  NameGeneratorRoster = 'NameGeneratorRoster',
  NameGeneratorList = 'NameGeneratorList',
  NameGeneratorAutoComplete = 'NameGeneratorAutoComplete',
  Sociogram = 'Sociogram',
  Information = 'Information',
  OrdinalBin = 'OrdinalBin',
  CategoricalBin = 'CategoricalBin',
  Narrative = 'Narrative',
  AlterForm = 'AlterForm',
  EgoForm = 'EgoForm',
  AlterEdgeForm = 'AlterEdgeForm',
  DyadCensus = 'DyadCensus',
  TieStrengthCensus = 'TieStrengthCensus',
}


export type SortOption = {
  property: string;
  direction: 'asc' | 'desc' | string;
};

export type PromptEdges = {
  display?: string[];
  create?: string;
}

export type AdditionalAttribute = {
  variable: string;
  value: boolean;
}

export type AdditionalAttributes = AdditionalAttribute[];

export type Prompt = {
  id: string;
  text: string;
  additionalAttributes?: AdditionalAttributes;
  createEdge?: string;
  edgeVariable?: string;
  negativeLabel?: string;
  variable?: string;
  bucketSortOrder?: SortOption[];
  binSortOrder?: SortOption[];
  color?: Color;
  sortOrder?: SortOption[];
  layout?: {
    layoutVariable?: string;
  },
  edges?: PromptEdges;
  highlight?: {
    allowHighlighting?: boolean;
    variable?: string;
  }
  otherVariable?: string;
  otherVariablePrompt?: string;
  otherOptionLabel?: string;
};

export type FilterRule = {
  id: string;
  type: 'alter' | 'ego' | 'edge' | string;
  options: {
    type?: string,
    operator: "EXISTS" | "NOT_EXISTS" | "EXACTLY" | "NOT" | "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "INCLUDES" | "EXCLUDES" | "OPTIONS_GREATER_THAN" | "OPTIONS_LESS_THAN" | "OPTIONS_EQUALS" | "OPTIONS_NOT_EQUALS" | string;
    attribute?: string;
    value?: boolean | number | string;
  }
}

export type FilterDefinition = {
  join: 'AND' | 'OR' | string;
  rules: FilterRule[];
}

export type SkipDefinition = {
  action: 'SKIP' | 'SHOW' | string;
  filter: FilterDefinition;
}

export type PresetDefinition = {
  id: string;
  label: string;
  layoutVariable: string;
  groupVariable?: string;
  edges?: {
    display?: string[];
  },
  highlight?: string[];
}

export type ItemDefinition = {
  id: string;
  type: 'asset' | 'text' | string;
  content: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | string;
};

export type StageSubject = {
  entity: 'ego' | 'node' | 'edge';
  type: string;
}

export type FormField = {
  variable: string;
  prompt: string;
}

export type Form = {
  title: string;
  fields: FormField[];
}

export interface Stage {
  id: string;
  type: string;
  label: string;
  title?: string; // Todo: remove this
  interviewScript?: string;
  form?: Form;
  introductionPanel?: Object, // Todo: create a Panel type
  subject?: StageSubject | StageSubject[];
  panels?: object[];
  prompts?: Prompt[];
  quickAdd?: string,
  behaviours?: object;
  filter?: FilterDefinition;
  skipLogic?: SkipDefinition;
  dataSource?: string;
  cardOptions?: object; // Todo: create a CardOptions type
  sortOptions?: {
    sortOrder: SortOption[];
    sortableProperties: object[]; // Todo: create a SortableProperty type
  }
  background?: {
    image?: string;
    concentricCircles?: number;
    skewedTowardCenter?: boolean;
  }
  searchOptions?: {
    fuzziness?: number;
    matchProperties?: string[];
  }
  presets?: PresetDefinition[];
  items?: ItemDefinition[];
}
