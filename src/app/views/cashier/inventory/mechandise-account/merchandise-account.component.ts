import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MeCount, Merchandise} from "../../../../models/merchandise";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";

@Component({
  selector: 'app-mechandise-account',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatTableModule
  ],
  templateUrl: './merchandise-account.component.html',
  styleUrl: './merchandise-account.component.scss'
})
export class MerchandiseAccountComponent {
  data = inject<MeCount[]>(MAT_DIALOG_DATA);
  displayedColumns: string[] = ['model', 'total', 'sold', 'stock', 'cost', 'price'];
  dataSource: MeCount[] = this.data;

  constructor() {
  }

  getTotalCount(field: "total" | "sold" | "totalCost" | "totalPrice") {
    return this.data.map(t => t[field]).reduce((acc, value) => acc + value, 0);
  }

  getTotalStock() {
    return this.data.map(t => t.total - t.sold).reduce((acc, value) => acc + value, 0);
  }

  getTotalCost() {
    return this.getTotalCount("totalCost");
  }

  getTotalPrice() {
    return this.getTotalCount("totalPrice");
  }
}
