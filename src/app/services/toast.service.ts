import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastLevel = "success" | "information" | "warning" | "error";

export interface ToastState {
  message: string;
  level: ToastLevel;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastState | null>(null);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor() { }

  get toast$() {
    return this.toastSubject.asObservable();
  }

  push(message:string, level: ToastLevel, duration: number = 3000) {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.toastSubject.next({message, level});
    this.timerId = setTimeout(() => this.clear(), duration);
  }

  clear(){
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.toastSubject.next(null);
  }
}
