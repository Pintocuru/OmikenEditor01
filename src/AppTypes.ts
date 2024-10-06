export type SelectedItem ={
  type: ItemType;
  index: number;
} | null;

export type ItemType = 'rule' | 'omikuji' | 'random';