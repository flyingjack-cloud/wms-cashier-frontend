import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTabChangeEvent, MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {Merchandise} from 'src/app/models/merchandise';
import {MerchandiseService} from 'src/app/services/merchandise.service';
import {Category} from 'src/app/models/category';
import {DialogDeleteMerchandiseComponent} from "./dialog-delete-merchandise/dialog-delete-merchandise.component";
import {DialogEditComponent} from "./dialog-edit-component/dialog-edit.component";
import {CreateMerchandiseComponent} from "./create-merchandise/create-merchandise.component";
import {CategoryManageComponent} from "./category-manage/category-manage.component";
import {CategorySelectComponent} from "../../components/category-select/category-select.component";
import {utils, writeFileXLSX} from 'xlsx';
import {DriveStep} from "driver.js";
import {IntroService} from "../../../services/intro.service";
import {MerchandiseAccountComponent} from "./mechandise-account/merchandise-account.component";
import {LocalDatePipe} from "../../../pipes/local-date.pipe";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    LocalDatePipe,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CategorySelectComponent,
    CreateMerchandiseComponent,
    CategoryManageComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, AfterViewInit {
  count: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'cate_name', 'imei', 'cost', 'price', 'create_date', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Merchandise>();

  hideCost: boolean = true;

  constructor(private merchandiseService: MerchandiseService, public dialog: MatDialog, private introService:IntroService) {
  }

  ngOnInit () {
    this.merchandiseService.getMerchandiseByPage(0, 500).subscribe(
      data => {
        this.count = data.count;
        this.dataSource.data = data.merchandise;
      }
    );
  }

  @ViewChild("tabGroup") tabGroup!:MatTabGroup;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (data: Merchandise, filter: string) => {
      return( data.category.name.toLowerCase().includes(filter.trim())
        || data.imei.toLowerCase().includes(filter.trim()))
    };

    // 生成初始引导
    if (!this.introService.checkGuided("inventory")){
      const steps:DriveStep[] = [
        { popover:{ title:"欢迎使用库存", description:"现在开始介绍库存管理功能， 包含三个板块", side:"right", align:"start" } },
        { element:"div[role=tab]:nth-child(1)", popover:{ title:"首先是库存管理", description:"查看当前库存，对库存商品进行操作", side:"right", align:"start" } },
        { element:"table", popover:{ title:"商品展示", description:"默认会显示全部商品", side:"right", align:"start" } },
        { element:"app-category-select", popover:{ title:"型号查询", description:"可以选择特定型号查询", side:"right", align:"start" } },
        { element:".filter", popover:{ title:"筛选", description:"也这里可以搜索商品", side:"right", align:"start" } },
        { element:"#excelBtn", popover:{ title:"导出表格", description:"点击这里可以导出表格", side:"right", align:"start" } },
        { element:"div[role=tab]:nth-child(2)", popover:{ title:"新增商品", description:"点击这里可以继续教程", side:"right", align:"start" } },
      ];

      this.introService.create(steps);
      this.introService.setGuided("inventory")
    }
  }

  // 切换tab是显示引导
  guide($event: MatTabChangeEvent) {
    if ($event.index == 1 && !this.introService.checkGuided("create")){
      const steps:DriveStep[] = [
        { popover:{ title:"新增商品", description:"现在开始教学新增商品", side:"right", align:"start" } },
        { element:"app-category-manage", popover:{ title:"选择型号", description:"首先需要依次选择商品的品牌和型号", side:"right", align:"start"} },
        { element:"app-category-manage button", popover:{ title:"添加品牌", description:"右方的按钮可以快速添加, 需要先添加品牌，选择后才可以添加型号", side:"right", align:"start" } },
        { element:"app-create-merchandise input[formControlName=cost]", popover:{ title:"成本价", description:"设置成本价", side:"right", align:"start" } },
        { element:"app-create-merchandise input[formControlName=price]", popover:{ title:"售价", description:"设置售价", side:"right", align:"start" } },
        { element:"#imeiInput", popover:{ title:"串号输入（1/2）", description:"手动或者扫码枪输入串号", side:"right", align:"start" } },
        { element:"#imeiBtn", popover:{ title:"串号输入（2/2）", description:"!!!必须点击这里的添加才会生效（可以多次添加)", side:"right", align:"start", } },
        { element:"app-create-merchandise mat-hint", popover:{ title:"串号输入", description:"添加好的串号将这里逐一显示", side:"right", align:"start", } },
        { element:"app-create-merchandise button[type=submit]", popover:{ title:"提交", description:"最后点击提交即可添加", side:"right", align:"start", } },
      ];

      this.introService.create(steps);
      this.introService.setGuided("create")
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // pageChangePage($event:PageEvent) {
  //   this.pageIndex = $event.pageIndex;
  //   this.pageSize = $event.pageSize
  //   this._refreshData();
  // }

  select(category: Category) {
    this.merchandiseService.getMerchandisesByCateId(category.id).subscribe(
      data => {
        this.dataSource.data = data;
        this.count = data.length;
      }
    );
  }

  openDeleteDialog(me: Merchandise) {
    this.dialog.open(DialogDeleteMerchandiseComponent, {
      width: '300px',
      height: '300px',
      data: me
    }).afterClosed().subscribe(result => {
        // 删除结束后刷新
        if (result.data) {
          this.select(result.data.category);
        }
      }
    );
  }

  openEditDialog(me: Merchandise) {
    this.dialog.open(DialogEditComponent, {
      width: '350px',
      height: '420px',
      data: me
    }).afterClosed().subscribe(result => {
        // 修改后刷新
        if (result.data) {
          this.select(result.data.category);
        }
      }
    );
  }

  total(mode: string) {
    let result;
    switch (mode) {
      case 'cost' :
        result = this.dataSource.filteredData.reduce((prev, cur, index, arr) =>
          prev + cur.cost, 0);
        break;
      case 'price' : result = this.dataSource.filteredData.reduce((prev, cur, index, arr) =>
        prev + cur.price, 0);
        break;
      default:
    }
    return result;
  }

  saveToExcel() {
    const wb = utils.book_new();
    // 设置表头
    const heading = [["序号", "型号", "成本", "售价", "串号", "录入时间"]];

    // map去除不需要的列
    let data = this.dataSource.filteredData.map(item => {
      return {
        id: item.id,
        cate: item.category.name,
        cost: item.cost,
        price: item.price,
        imei: item.imei,
        createTime: item.createTime
      }
    })

    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, heading)
    utils.sheet_add_json(ws, data, {origin: 'A2', skipHeader: true});
    delete (ws['06'])

    // 设置单元格间距
    var wscols = [
      {wch:6},
      {wch:10},
      {wch:10},
      {wch:10},
      {wch:30},
      {wch:50},
    ];
    ws['!cols'] = wscols;

    utils.book_append_sheet(wb, ws, "Sheet1");
    const fileName = "库存情况" + "_" +  new Date().getFullYear() +
                            "_" +  (new Date().getMonth() + 1) +
                             "_" +  new Date().getDay() + ".xlsx";
      writeFileXLSX(wb, fileName);
  }

  account(){
    this.merchandiseService.account().subscribe(
      data => {
        this.dialog.open(MerchandiseAccountComponent, {
          width: '350px',
          height: '420px',
          data: data
        });
      }
    )
  }
}
