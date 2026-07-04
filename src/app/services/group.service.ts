import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize, map, Observable} from "rxjs";
import {Group} from "../models/group";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {UserProfile} from "../models/profile";
import {ApiRes} from "../models/ApiRes";
import {Authority} from "../models/authority";
import {RESTfulResponse} from "../models/response";
import {toDate, toIsoUtcString} from "../utils/date-time";

interface GroupDto {
  id: number;
  storeName: string;
  address: string;
  contact: string;
  createTime?: Date | string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groupSubject$ = new BehaviorSubject<Group>({
    id: -1,
    storeName: "默认",
    address: "默认地址",
    contact: "默认联系方式",
    createTime: new Date()
  });

  URL_PREFIX =  "group";

  constructor(private http:HttpClient, private router:Router) {}

  /**
   * 获取Group
   */
  getGroup() {
    return this.groupSubject$.asObservable();
  }

  /**
   * 重新从服务器拉取归属group
   */
  _refresh(){
    this.http.get<RESTfulResponse<GroupDto>>(this.URL_PREFIX + "/").subscribe(res => {
      this.groupSubject$.next(this.toGroup(res.data));
    })
  }

  /**
   * 新建group
   *
   * @param storeName
   * @param address
   * @param contact
   * @param createTime
   */
  createGroup(storeName: string, address:string, contact: string, createTime: Date) {
    let queryParas = new HttpParams().set("storeName", storeName).set("address", address)
      .set("contact", contact).set("createTime", toIsoUtcString(createTime));
    return this.http.post(this.URL_PREFIX + "/",null, {params: queryParas}).pipe(
      finalize(() => this._refresh())
    );
  }

  /**
   * 更新店名
   */
  updateStoreName(storeName: string) {
    let queryParas = new HttpParams().set("storeName", storeName);
    return this.http.put(this.URL_PREFIX + "/storename",null, {params: queryParas}).pipe(
      finalize(() => this._refresh())
    );
  }

  /**
   * 更新地址
   */
  updateAddress(address: string) {
    let queryParas = new HttpParams().set("address", address);
    return this.http.put(this.URL_PREFIX + "/address",null, {params: queryParas}).pipe(
      finalize(() => this._refresh())
    );
  }

  /**
   * 更新店联系方式
   */
  updateContact(contact: string) {
    let queryParas = new HttpParams().set("contact", contact);
    return this.http.put(this.URL_PREFIX + "/contact",null, {params: queryParas}).pipe(
      finalize(() => this._refresh())
    );
  }

  /**
   * 获取group下所有用户
   */
  getUsersInGroup(): Observable<UserProfile[]> {
    return this.http.get<RESTfulResponse<UserProfile[]>>(this.URL_PREFIX + '/staffs').pipe(
      map(res => res.data),
    );
  }

  /**
   * 将user移除出group
   */
  deleteUserInGroup(userId: number) {
    let queryParas = new HttpParams().set("userId", userId);
    return this.http.delete(this.URL_PREFIX + '/staff', {params: queryParas});
  }

  /**
   * 根据groupID添加请求
   *
   * @param groupId
   */
  createJoinRequestByGroupId(groupId: number) {
    let queryParas = new HttpParams().set("groupId", groupId);
    return this.http.post<ApiRes>(this.URL_PREFIX + "/join/id", null, {params: queryParas});
  }

  /**
   * 根据groupID添加请求
   *
   * @param phone
   */
  createJoinRequestByPhone(phone: string) {
    let queryParas = new HttpParams().set("phone", phone);
    return this.http.post<ApiRes>(this.URL_PREFIX + "/join/phone", null, {params: queryParas});
  }

  /**
   * 获取加入请求的group，null表示未提交任何申请
   */
  getGroupInRequest(){
    return this.http.get<RESTfulResponse<GroupDto>>(this.URL_PREFIX + "/join/").pipe(
      map(res => this.toGroup(res.data)),
    );
  }

  /**
   * 删除当前用户的加入请求
   */
  deleteJoinRequest() {
    return this.http.delete<ApiRes>(this.URL_PREFIX + "/join/delete");
  }

  /**
   * 获取当前group下所有申请
   */
  getUsersUnderRequest(){
    return this.http.get<RESTfulResponse<UserProfile[]>>(this.URL_PREFIX + "/join/users").pipe(
      map(res => res.data),
    );
  }

  /**
   * 删除当前用户的加入请求
   */
  disagreeRequest(userId: number) {
    let queryParas = new HttpParams().set("userId", userId);
    return this.http.delete<ApiRes>(this.URL_PREFIX + "/join/delete/id", {params: queryParas});
  }

  /**
   * 同意加入申请
   *
   */
  agreeRequest(userId: number, shopping: boolean, inventory: boolean, statistics: boolean) {
    let queryParas = new HttpParams().set("userId", userId).set("shopping", shopping)
      .set("inventory", inventory).set("statistics", statistics)
    return this.http.post<ApiRes>(this.URL_PREFIX + "/join/agree", null ,{params: queryParas});
  }

  /**
   * 更新权限
   *
   * @param userId
   * @param shopping
   * @param inventory
   * @param statistics
   */
  updatePermissions(userId: number, shopping: boolean, inventory: boolean, statistics: boolean) {
    let queryParas = new HttpParams().set("userId", userId).set("shopping", shopping)
      .set("inventory", inventory).set("statistics", statistics)
    return this.http.put<ApiRes>(this.URL_PREFIX + "/permissions", null ,{params: queryParas});
  }

  /**
   *  获取用户权限
   */
  getPermissionsByUserId(userId: number) {
    let queryParas = new HttpParams().set("userId", userId);
    return this.http.get<RESTfulResponse<Authority[]>>(this.URL_PREFIX + "/permissions", {params: queryParas}).pipe(
      map(res => res.data),
    );
  }

  private toGroup(group: GroupDto): Group {
    return {
      id: group.id,
      storeName: group.storeName,
      address: group.address,
      contact: group.contact,
      createTime: toDate(group.createTime ?? group.createdAt),
    };
  }
}
