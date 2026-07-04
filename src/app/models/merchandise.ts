import { Category } from "./category";

export interface Merchandise {
    id: number;
    category: Category,
    cost: number,
    price: number,
    imei: string,
    sold: boolean,
    createTime: Date
}

export interface MeCount {
  cateName: string,
  total: number,
  sold: number,
  totalCost: number,
  totalPrice: number
}
