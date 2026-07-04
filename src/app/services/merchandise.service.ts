import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MeCount, Merchandise} from '../models/merchandise';
import {map, Observable} from 'rxjs';
import {ApiRes} from "../models/ApiRes";
import {RESTfulResponse} from "../models/response";
import {Category} from "../models/category";
import {toDate, toIsoUtcString} from "../utils/date-time";

interface MerchandiseDto {
  id: number;
  groupId?: number;
  cateId?: number;
  category?: Category;
  cost: number | string;
  price: number | string;
  imei: string;
  sold: boolean;
  createTime?: Date | string;
  createdAt?: string;
}

export type MerchandisePage =
{
  count: number;
  merchandise: Merchandise[];
}

interface MerchandisePageDto {
  count: number;
  merchandise: MerchandiseDto[];
}

interface MeCountDto {
  cateName: string;
  total: number | string;
  sold: number | string;
  totalCost: number | string;
  totalPrice: number | string;
}

export type MerchandiseCacheKey = {
  page:number;
  limit:number;
}

@Injectable({
  providedIn: 'root'
})
export class MerchandiseService {
  constructor(private http:HttpClient) { }

  getMerchandiseByPage(page:number, limit:number, sold: boolean = false): Observable<MerchandisePage> {
    let queryParams = new HttpParams();
    queryParams =  queryParams.append("offset", page * limit);
    queryParams =  queryParams.append("limit", limit);
    queryParams = queryParams.append("sold", sold);
    return this.http.get<RESTfulResponse<MerchandisePageDto>>("merchandise", { params: queryParams }).pipe(
      map(res => ({
        count: res.data.count,
        merchandise: res.data.merchandise.map(item => this.toMerchandise(item)),
      })),
    );
  }

  getMerchandisesByCateId(cateId:number):Observable<Merchandise[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("cate_id", cateId);

    return this.http.get<RESTfulResponse<MerchandiseDto[]>>("merchandise/cate", {params: queryParams}).pipe(
      map(res => res.data.map(item => this.toMerchandise(item))),
    );
  }

  updateMerchandise(cateId:number, cost: number, price: number, imei:string){
    let queryParams = new HttpParams().set("cost", cost).set("price", price).set("imei", imei);
    return this.http.put<ApiRes>("merchandise/" + cateId , null,{params: queryParams});
  }

  insertMerchandiseSet(cateId:number, cost: number, price: number, createTime: Date, imeiSet: Set<string>){
    let queryParams = new HttpParams().set("cate_id", cateId)
      .set("cost", cost).set("price", price).set("create_time", toIsoUtcString(createTime))
    imeiSet.forEach(imei => queryParams = queryParams.append("imei_list", imei));

    return this.http.post<RESTfulResponse<MerchandiseDto[] | null>>("merchandise", null,{params: queryParams}).pipe(
      map(res => res.data?.map(item => this.toMerchandise(item)) ?? []),
    );
  }

  deleteMerchandise(me_id:number){
    return this.http.delete<ApiRes>("merchandise/" + me_id);
  }

  searchMerchandise(text: string, sold: boolean = false): Observable<Merchandise[]> {
    let queryParams = new HttpParams().set("text", text).set("sold", sold);
    return this.http.get<RESTfulResponse<MerchandiseDto[]>>("merchandise/search", {params: queryParams}).pipe(
      map(res => res.data.map(item => this.toMerchandise(item))),
    );
  }

  /**
   * 盘库统计
   */
  account(): Observable<MeCount[]> {
    return this.http.get<RESTfulResponse<MeCountDto[]>>("merchandise/account").pipe(
      map(res => res.data.map(item => ({
        cateName: item.cateName,
        total: Number(item.total),
        sold: Number(item.sold),
        totalCost: Number(item.totalCost),
        totalPrice: Number(item.totalPrice),
      }))),
    );
  }

  private toMerchandise(item: MerchandiseDto): Merchandise {
    return {
      id: item.id,
      category: item.category ?? this.categoryFallback(item.cateId),
      cost: Number(item.cost),
      price: Number(item.price),
      imei: item.imei,
      sold: item.sold,
      createTime: toDate(item.createTime ?? item.createdAt),
    };
  }

  private categoryFallback(cateId?: number): Category {
    return {
      id: cateId ?? -1,
      parentId: -1,
      name: cateId == null ? "未知型号" : `型号 ${cateId}`,
    };
  }
}
