import {Component} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";

import {MatButtonModule} from "@angular/material/button";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";

import {MatIconModule} from "@angular/material/icon";
import {CategoryManageComponent} from "../category-manage/category-manage.component";
import {MatListModule} from "@angular/material/list";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {Category} from "../../../../models/category";
import {ToastService} from "../../../../services/toast.service";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {finalize, first} from "rxjs";
import {PreventEnterDirective} from "../../../../directives/prevent-enter.directive";

interface MerchandiseInsertForm{
  cost: FormControl<number>;
  cate: FormControl<number>;
  price: FormControl<number>;
  date: FormControl<Date>;
}

@Component({
  selector: 'app-create-merchandise',
  standalone: true,
  imports: [
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    CategoryManageComponent,
    MatListModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    PreventEnterDirective
  ],
  templateUrl: './create-merchandise.component.html',
  styleUrl: './create-merchandise.component.scss'
})
export class CreateMerchandiseComponent{
  imeiSet: Set<string> = new Set();
  selectedCategory!: Category;
  loading: boolean = false;

  constructor(private toast: ToastService,
              private merchandiseService:MerchandiseService) {
  }

  form = new FormGroup<MerchandiseInsertForm>({
      cost: new FormControl(0, {nonNullable: true, validators:[Validators.required, Validators.min(1), Validators.max(999999)]}),
      cate: new FormControl(-1, {nonNullable: true, validators:[Validators.required, Validators.min(1)]}),
      price: new FormControl(0, {nonNullable: true, validators:[Validators.required, Validators.min(1), Validators.max(999999)]}),
      date: new FormControl(new Date(), {nonNullable: true, validators:[Validators.required]}),
  });

  addImei(imei:HTMLInputElement) {
    if (imei.value != "") {
      this.imeiSet.add(imei.value);
      imei.value = "";
    }
  }

  deleteImeiFromSet(imei: string){
    this.imeiSet.delete(imei);
  }

  /**
   * 绑定选择的cate
   *
   * @param cate
   */
  select(cate:Category) {
    this.selectedCategory = cate;
    this.form.controls.cate.setValue(cate.id);

    this.merchandiseService.getMerchandisesByCateId(cate.id).pipe(first()).subscribe(data => {
      this.form.controls.cost.setValue(data[0].cost);
      this.form.controls.price.setValue(data[0].price);
    });
  }

  submit() {
    this.loading = true;

    if (this.imeiSet.size <= 0){
      this.toast.push("需要至少一个串号", "warning");
      this.loading = false;
    }
    else {
      this.merchandiseService.insertMerchandiseSet(this.form.value.cate!, this.form.value.cost!, this.form.value.price!, this.form.value.date!, this.imeiSet)
        .pipe(finalize(()=> this.loading = false ))
        .subscribe({
          complete: () =>
          {
            this.toast.push("添加成功", "success");
            this.form.controls.cost.reset();
            this.form.controls.price.reset();
            this.imeiSet = new Set<string>();
          }
        });
      }
    }
}
