export interface SelectedItem {
  type: ItemType;
  index: number;
}

export type ItemType = 'rule' | 'omikuji' | 'random';