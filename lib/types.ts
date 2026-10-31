export type Item = {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly location: string;
  readonly description: string;
  readonly has_photo: number;
  readonly seller_id: number | null;
  readonly seller_name: string | null;
  readonly created_at: string;
};
export type MarketFilters = {
  readonly region: string;
  readonly price: string;
  readonly sort: string;
};

export type User = { readonly id: number; readonly name: string };
