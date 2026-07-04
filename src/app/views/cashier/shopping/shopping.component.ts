import {AfterViewInit, Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {Merchandise} from 'src/app/models/merchandise';
import {OrderConfirmComponent} from './order-confirm/order-confirm.component';
import {DriveStep} from "driver.js";
import {IntroService} from "../../../services/intro.service";
import {Order, OrderGenerator} from "../../../models/order";
import {SearchComponent} from "../../components/search/search.component";

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    NgFor,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    SearchComponent
  ],
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss']
})
export class ShoppingComponent implements AfterViewInit{
  selectedMerchandise: Merchandise | undefined;
  cart: Order[] = [];

  constructor(public dialog:MatDialog, private introService: IntroService){}

  updateList(merchandises:Merchandise) {
    this.selectedMerchandise = merchandises;
  }

  /**
   * 将商品加入购物车
   *
   * @param item
   */
  addToCart(item:Merchandise) {
      // 如果购物车已经存在，不允许添加
      if(this.cart.find(order => order.merchandise.id == item.id) != undefined ){
        return
      }

      this.cart.push(OrderGenerator(item, item.price));
      this.selectedMerchandise = undefined;
  }

  /**
   * 将商品移出购物车
   *
   * @param item
   */
  removeFromCart(item:Order) {
    this.cart = this.cart.filter(order => order != item);
  }

  /**
   * 清空购物车
   */
  clearCart() {
    this.cart = [];
  }

  /**
   * 修改商品结算价格
   *
   * @param event
   * @param item
   */
  changePrice(event: any, item: Order) {
    item.sellingPrice = Number((event.target as HTMLInputElement).value);
  }

  /**
   * 提交订单
   */
  orderConfirm() {
    const dialogRef = this.dialog.open<OrderConfirmComponent>(OrderConfirmComponent, {
      data: {cart: this.cart},
      height: "800px",
      width: "350px"
    }).afterClosed().subscribe(
      result => {
        if (result.isSuccess) {
          location.reload(); //提交成功 刷新页面
        }
      });
  }

  ngAfterViewInit(): void {
    //生成初始引导
    if (!this.introService.checkGuided("shopping")){

    const tourMe = {
      id: -1,
      category: {
        id: -1,
        parentId: -1,
        name: "演示用"
      },
      cost: 999,
      price: 9999,
      imei: "123456",
      sold: false,
      createTime: new Date()
    };

    this.selectedMerchandise = tourMe;
    this.cart.push(OrderGenerator(tourMe, tourMe.price));
    const steps:DriveStep[] = [
        { popover:{ title:"收银功能", description:"接下来介绍收银功能", side:"right", align:"start" } },
        { element:"app-search .search-field", popover:{ title:"查找商品(1/2)", description:"首先在这里输入型号或者扫码枪输入串号", side:"right", align:"start" } },
        { element:"app-search button", popover:{ title:"查找商品(2/2)", description:"点击这里搜索", side:"right", align:"start" } },
        { element:".list-area mat-card-actions button", popover:{ title:"添加结账商品", description:"点击结账添加进购物车", side:"right", align:"start" } },
        { element:".receipt-card", popover:{ title:"购物车", description:"这里会展示购物车的上商品", side:"right", align:"start" } },
        { element:"#price", popover:{ title:"实际价格", description:"这里修改实际销售价格", side:"right", align:"start" } },
        { element:".receipt-footer button", popover:{ title:"提交", description:"点击提交即可", side:"right", align:"start" } },
    ];

      this.introService.create(steps);
      this.introService.setGuided("shopping")
    }
  }
}
