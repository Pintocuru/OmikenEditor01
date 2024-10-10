import type { omikujiRule, OmikujiMessage, Placeholder } from './types';

export type SelectedItem ={
  type: ItemType;
  item: ItemContent;
  index?: number;
} | null;

export type ItemType = 'rules' | 'omikuji' | 'placeholder';
export type ItemContent = omikujiRule | OmikujiMessage | Placeholder;