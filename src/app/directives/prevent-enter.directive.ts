import {Directive, ElementRef, HostListener} from '@angular/core';

/**
 * 阻止按钮进行表单enter冒泡提交
 */
@Directive({
  selector: '[preventEnter]',
  standalone: true
})
export class PreventEnterDirective {
  @HostListener("window:keydown", ["$event"]) onKeyEnter($event:KeyboardEvent){
    if ($event.key == "Enter") {
      $event.preventDefault();
    }
  }

  constructor(private el: ElementRef) {
    if (el.nativeElement instanceof HTMLButtonElement) {
      (el.nativeElement as HTMLButtonElement).type = "button";
    }
  }
}
