import {Injectable} from '@angular/core';
import {Notice} from "../models/notice";
import {map, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {RESTfulResponse} from "../models/response";
import {toDate} from "../utils/date-time";

interface NoticeDto {
  id: number;
  type: string;
  publishTime: Date | string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  constructor(private http:HttpClient) { }

  getNotice(type: string): Observable<Notice> {
    let queryParas = new HttpParams().set("type", type);
    return this.http.get<RESTfulResponse<NoticeDto>>("notice/", {params: queryParas}).pipe(
      map(res => ({
        ...res.data,
        publishTime: toDate(res.data.publishTime),
      })),
    );
  }
}
