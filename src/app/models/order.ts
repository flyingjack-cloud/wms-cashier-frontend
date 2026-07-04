import {Merchandise} from "./merchandise";

export interface Order {
  id: number;
  merchandise: Merchandise;
  sellingPrice: number;
  remark: string;
  sellingTime: Date;
  returned: boolean;
}

export const OrderGenerator = (merchandise: Merchandise, sellingPrice: number): Order => {
  return {
    id: -1,
    merchandise: merchandise,
    sellingPrice: sellingPrice,
    remark: "",
    sellingTime: new Date(),
    returned: false,
  }
}
