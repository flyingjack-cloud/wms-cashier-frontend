import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, finalize, map, Observable, tap } from 'rxjs';
import { DEFAULT_AVATAR, UserProfile } from '../models/profile';
import { Authority, Permission, Role } from '../models/authority';
import { RESTfulResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public profile = new BehaviorSubject<UserProfile>({
    "userId": -1,
    "nickname": "未设置",
    "email": "",
    "phoneNumber": "",
    "avatar": DEFAULT_AVATAR
  });

  public role = new BehaviorSubject<Role>(Role.BLANK);
  public permissions = new BehaviorSubject<Authority[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * 获取用户档案
   */
  getProfile(): Observable<UserProfile> {
    return this.profile.asObservable();
  }

  refreshProfile() {
    this.http.get<RESTfulResponse<UserProfile>>('profile/').subscribe({
      next: res => this.profile.next(this.normalizeProfile(res.data)),
      error: () => {},
    });
  }

  /**
   * 获取当前用户角色
   */
  getRole(): Observable<Role> {
    return this.role.asObservable();
  }

  /**
   * 获取当前用户权限
   */
  getPermissions(): Observable<Authority[]> {
    return this.permissions.asObservable();
  }

  refreshRole() {
    this.fetchRole().subscribe({ error: () => {} });
  }

  refreshPermission() {
    this.fetchPermission().subscribe({ error: () => {} });
  }

  // Exposes the underlying request (rather than just firing it) so callers like
  // permissionGuard can react to this specific attempt failing instead of
  // polling the cached BehaviorSubject, which never changes on error.
  fetchRole(): Observable<Role> {
    return this.http.get<RESTfulResponse<string>>('profile/role').pipe(
      map(data => data.data as Role),
      tap(role => this.role.next(role)),
    );
  }

  fetchPermission(): Observable<Authority[]> {
    return this.http.get<RESTfulResponse<string[]>>('profile/permissions').pipe(
      map(data => data.data.map(a => ({ authority: a as Permission }))),
      tap(permissions => this.permissions.next(permissions)),
    );
  }

  /**
   * 更新nickname
   * @param nickname
   */
  updateNickname(nickname: string) {
    let queryParas = new HttpParams().set("nickname", nickname);
    return this.http.put('profile/nickname', null, { params: queryParas }).pipe(
      finalize(() => this.refreshProfile()) // 完成后记得更新状态
    );
  }

  private normalizeProfile(profile: UserProfile): UserProfile {
    return {
      ...profile,
      nickname: profile.nickname || "未设置",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      avatar: profile.avatar && profile.avatar !== "default" ? profile.avatar : DEFAULT_AVATAR,
    };
  }
}
