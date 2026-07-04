import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import {Observable, map, of} from 'rxjs';
import { RESTfulResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http:HttpClient) { }

  getAllRootCategories(): Observable<Category[]>{
    return this.getCategoriesByParentId(0);
  }

  getCategoriesByParentId(parentId: number): Observable<Category[]>{
    if (parentId < 0) {
      return of([]);
    }
    return this.http.get<RESTfulResponse<Category[]>>("category/parent/" + parentId).pipe(
      map(res => res.data),
    );
  }

  getCategoryDetailById(cateId: number): Observable<Category> {
    return this.http.get<RESTfulResponse<Category>>("category/" + cateId).pipe(
      map(res => res.data),
    );
  }

  insertCategory(parentId: number, name: string) {
    let queryParas = new HttpParams().set("parentId", parentId).set("name", name);
    return this.http.post("category/", null, {params: queryParas});
  }

  deleteCategory(cateId: number) {
    return this.http.delete<String>("category/" + cateId);
  }
}
