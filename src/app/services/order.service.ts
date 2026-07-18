import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Order} from "../models/order";
import {map} from "rxjs";
import {RESTfulResponse} from "../models/response";
import {Merchandise} from "../models/merchandise";
import {Category} from "../models/category";
import {toDate, toIsoUtcString} from "../utils/date-time";

export interface OrderPage {
  count: number;
  orders: Order[];
}

 interface OrderPageDto {
  count: number;
  orders: OrderDto[];
}

export interface OrderDto {
  id: number;
  groupId?: number;
  meId?: number;
  merchandise?: MerchandiseDto;
  sellingPrice: number | string;
  remark: string;
  sellingTime: Date | string;
  returned: boolean;
}

interface MerchandiseDto {
  id: number;
  cateId?: number;
  category?: Category;
  cost: number | string;
  price: number | string;
  imei: string;
  sold: boolean;
  createTime?: Date | string;
  createdAt?: string;
}

interface OrderRequest {
  groupId?: number;
  meId: number;
  sellingPrice: number;
  sellingTime: string;
  remark: string;
  returned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http:HttpClient) { }

  batchOrder(orders: Order[] ){
    const body: OrderRequest[] = orders.map(order => ({
      meId: order.merchandise.id,
      sellingPrice: order.sellingPrice,
      sellingTime: toIsoUtcString(order.sellingTime),
      remark: order.remark,
      returned: order.returned,
    }));

    return this.http.post<RESTfulResponse<number[]>>("order/batch", body).pipe(map(res => res.data));
  }

  getOrdersByDateRange(start: Date, end: Date, page: number = 0, limit: number = 500) {
    let endOptimized = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
    let queryParas = new HttpParams()
      .set("start", toIsoUtcString(start))
      .set("end", toIsoUtcString(endOptimized))
      .set("offset", page * limit)
      .set("limit", limit);
    return this.http.get<RESTfulResponse<OrderPageDto>>('order/range', { params: queryParas}).pipe(
      map(res => res.data.orders.map(order => this.toOrder(order))),
    );
  }

  returnOrder(orderId: number) {
    return this.http.put('order/return/' + orderId, null);
  }

  private toOrder(order: OrderDto): Order {
    return {
      id: order.id,
      merchandise: order.merchandise ? this.toMerchandise(order.merchandise) : this.merchandiseFallback(order.meId),
      sellingPrice: Number(order.sellingPrice),
      remark: order.remark,
      sellingTime: toDate(order.sellingTime),
      returned: order.returned,
    };
  }

  private merchandiseFallback(meId?: number): Merchandise {
    return {
      id: meId ?? -1,
      category: {
        id: -1,
        parentId: -1,
        name: meId == null ? "未知型号" : `商品 ${meId}`,
      },
      cost: 0,
      price: 0,
      imei: "",
      sold: true,
      createTime: new Date(),
    };
  }

  private toMerchandise(item: MerchandiseDto): Merchandise {
    return {
      id: item.id,
      category: item.category ?? {
        id: item.cateId ?? -1,
        parentId: -1,
        name: item.cateId == null ? "未知型号" : `型号 ${item.cateId}`,
      },
      cost: Number(item.cost),
      price: Number(item.price),
      imei: item.imei,
      sold: item.sold,
      createTime: toDate(item.createTime ?? item.createdAt),
    };
  }
}
