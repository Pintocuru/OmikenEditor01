// AppTypes.ts:Omiken用型指定
import type { omikujiRule, OmikujiMessage, Placeholder } from './types';

export type SelectItem ={
  type: ItemType;
  index: number;
  name?: string |number;
  items?: ItemContent[];
} | null;

export type ItemType = 'rules' | 'omikuji' | 'placeholder';
export type ItemContent = omikujiRule | OmikujiMessage | Placeholder;
