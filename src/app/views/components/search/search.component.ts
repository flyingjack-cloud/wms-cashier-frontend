import {Component, EventEmitter, Output} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {Observable, of, tap} from 'rxjs';
import {Merchandise} from 'src/app/models/merchandise';
import {MerchandiseService} from "src/app/services/merchandise.service";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Output() selectEvent = new EventEmitter<Merchandise>();
  searchControl = new FormControl('', [Validators.required])
  result: Observable<Merchandise[]> = of();

  constructor(private service: MerchandiseService){

  }

  submit(event: SubmitEvent) {
    event.preventDefault();
    this.search();
  }

  search() {
    if (this.searchControl.valid && this.searchControl.value) {
      // 如果是对象 改为imei
      let text = (typeof this.searchControl.value === "string") ? this.searchControl.value: (this.searchControl.value as Merchandise).imei;
      this.result = this.service.searchMerchandise(text).pipe(
        tap((mes: Merchandise[]) => {
          if (mes.length == 0) {
            this.searchControl.setErrors({emptyResult: true});
          }
        })
      );
    }
  }

  select(item:MatAutocompleteSelectedEvent) {
    this.selectEvent.emit(item.option.value);
  }

  // 用于解构显示
  displayFn(value: Merchandise){
      return value.imei;
  }
}
