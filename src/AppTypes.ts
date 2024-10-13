// AppTypes.ts:Omiken用型指定
import type { omikujiRule, OmikujiMessage, Placeholder } from './types';

export type SelectedItem ={
  type: ItemType;
  index: number;
  item?: ItemContent;
} | null;

export type ItemType = 'rules' | 'omikuji' | 'placeholder';
export type ItemContent = omikujiRule | OmikujiMessage | Placeholder;
