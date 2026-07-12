import {Component, Inject, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {DecimalPipe, DOCUMENT} from "@angular/common";
import {ChineseCapitalPipe} from "../../../pipes/ChineseCapital";
import {UserService} from "../../../services/user.service";
import {GroupService} from "../../../services/group.service";
import {Order} from "../../../models/order";
import { CategoryService } from 'src/app/services/category.service';
import { UserProfile } from 'src/app/models/profile';
import { Group } from 'src/app/models/group';
import { CustomerDetail } from 'src/app/models/customer';
import {LocalDatePipe} from "../../../pipes/local-date.pipe";
import {DEFAULT_AVATAR} from "../../../models/profile";

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [
    LocalDatePipe,
    DecimalPipe,
    ChineseCapitalPipe
  ],
  templateUrl: './receipt-print.component.html',
  styleUrl: './receipt-print.component.scss',
})
export class ReceiptPrintComponent implements OnInit{
  @Input() data: Order[] = [];
  @Input() customerDetail: CustomerDetail = {
    name: "",
    phone: "",
    address: ""
  };

  userprofile: UserProfile  = {
      userId: 0,
      nickname: "",
      email: "",
      phoneNumber: "",
      avatar: DEFAULT_AVATAR
  }

  group: Group = {
    id: -1,
    storeName: "默认",
    address: "默认地址",
    contact: "默认联系方式",
    createTime: new Date()
  };

  models: String[] = [];

  today = new Date();
  constructor(@Inject(DOCUMENT) private document: Document,
              private changeDetectorRef: ChangeDetectorRef,
              public userService: UserService,
              public groupService: GroupService,
              public categorService: CategoryService) {
  }

  total() {
    return this.data.reduce((pre, cur, idx, arr) => {
      return pre + cur.sellingPrice;
    }, 0)
  }

  print(){
    this.changeDetectorRef.detectChanges();

    const printSection = this.document.getElementById('print-section');
    if (!printSection) {
      console.error('Print section with id print-section not found.');
      return;
    }

    const printFrame = this.document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.left = '-9999px';
    printFrame.style.top = '0';
    printFrame.style.width = '1px';
    printFrame.style.height = '1px';
    printFrame.style.border = '0';
    this.document.body.appendChild(printFrame);

    const frameDocument = printFrame.contentDocument ?? printFrame.contentWindow?.document;
    if (!frameDocument || !printFrame.contentWindow) {
      printFrame.remove();
      console.error('Could not create print frame.');
      return;
    }

    let printed = false;
    const print = () => {
      if (printed) {
        return;
      }
      printed = true;
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => printFrame.remove(), 1000);
    };

    frameDocument.open();
    frameDocument.write(`
      <!doctype html>
      <html>
        <head>
          <title></title>
          <link rel="stylesheet" type="text/css" href="assets/css/receipt.css">
          <style>
            table,
            table tr th,
            table tr td {
              font-weight: 100;
              font-size: 10pt;
              text-align: center;
              border-collapse: collapse;
              border: 0.2mm solid #000;
              background-color: #FFF;
            }
          </style>
        </head>
        <body>${printSection.innerHTML}</body>
      </html>
    `);
    frameDocument.close();

    const stylesheet = frameDocument.querySelector('link[rel="stylesheet"]') as HTMLLinkElement | null;
    const fallbackTimer = setTimeout(print, 500);

    if (stylesheet) {
      stylesheet.onload = () => {
        clearTimeout(fallbackTimer);
        print();
      };
      stylesheet.onerror = () => {
        clearTimeout(fallbackTimer);
        print();
      };
    }
  }

  ngOnInit(): void {
      this.userService.getProfile().subscribe(profile => {
        this.userprofile = profile;
      });

      this.groupService.getGroup().subscribe(g => {
        this.group = g;
      });

      for (let i = 0; i < this.data.length; i++) {
        this.categorService.getCategoryDetailById(this.data[i].merchandise.category.parentId).subscribe(c => {
            this.models.push(c.name);
        });
      }
  }
}
