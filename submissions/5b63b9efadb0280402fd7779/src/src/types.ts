export type Log = (msg: string) => void;

export type Item = {
  readonly count: number;
  readonly value: number;
  readonly subTotalValue: number;
};

export type ImportantIndexedItem = {
  readonly index: number;
  readonly importance: number;
  readonly subTotalImportance: number;
  readonly estOpValue: number;
  readonly estOpSubTotalValue: number;
  readonly tradability: number;
  readonly count: number;
  readonly value: number;
  readonly subTotalValue: number;
};
