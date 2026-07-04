import {Injectable} from '@angular/core';
import {driver, DriveStep} from "driver.js";

@Injectable({
  providedIn: 'root'
})
export class IntroService {
  static CASHIER_HOME_SHOW = "cashier_home_tour";
  static CASHIER_Inventory_HOME_SHOW = "cashier_inventory_home_tour";
  static CASHIER_Inventory_CREATE_SHOW = "cashier_inventory_create_tour";
  static CASHIER_Inventory_EDIT_SHOW = "cashier_inventory_edit_tour";

  static CASHIER_SHOPPING_SHOW = "cashier_shopping_tour";
  static CASHIER_STATISTICS_SHOW = "cashier_statistics_tour";

  constructor() { }

  create(steps:DriveStep[]) {
    const driverObj = driver({
      nextBtnText: '下一步—›',
      prevBtnText: '‹—上一步',
      doneBtnText: '✕退出',
      showButtons: [
        'next',
        'previous',
        'close'
      ],
      showProgress: true,
      steps: steps,
      onDestroyed: () => location.reload()
    });
    driverObj.drive();
  }

  checkGuided(page: "home" | "shopping" | "inventory" | "create" | "edit" | "statistics") {
    let result = null;
    switch (page){
      case "home": result = localStorage.getItem(IntroService.CASHIER_HOME_SHOW); break;
      case "shopping": result = localStorage.getItem(IntroService.CASHIER_SHOPPING_SHOW); break;
      case "inventory": result = localStorage.getItem(IntroService.CASHIER_Inventory_HOME_SHOW); break;
      case "create": result = localStorage.getItem(IntroService.CASHIER_Inventory_CREATE_SHOW); break;
      case "edit": result = localStorage.getItem(IntroService.CASHIER_Inventory_EDIT_SHOW); break;
      case "statistics": result = localStorage.getItem(IntroService.CASHIER_STATISTICS_SHOW); break;
    }
    return  result != null;
  }

  setGuided(page: "home" | "shopping" | "inventory" | "create" | "edit" | "statistics"){
    switch (page){
      case "home": localStorage.setItem(IntroService.CASHIER_HOME_SHOW, "true"); break;
      case "shopping": localStorage.setItem(IntroService.CASHIER_SHOPPING_SHOW,"true"); break;
      case "inventory": localStorage.setItem(IntroService.CASHIER_Inventory_HOME_SHOW, "true"); break;
      case "create": localStorage.setItem(IntroService.CASHIER_Inventory_CREATE_SHOW, "true"); break;
      case "edit": localStorage.setItem(IntroService.CASHIER_Inventory_EDIT_SHOW, "true"); break;
      case "statistics": localStorage.setItem(IntroService.CASHIER_STATISTICS_SHOW, "true"); break;
    }
  }

  clear() {
    localStorage.removeItem(IntroService.CASHIER_HOME_SHOW);
    localStorage.removeItem(IntroService.CASHIER_SHOPPING_SHOW);
    localStorage.removeItem(IntroService.CASHIER_Inventory_HOME_SHOW);
    localStorage.removeItem(IntroService.CASHIER_Inventory_CREATE_SHOW);
    localStorage.removeItem(IntroService.CASHIER_Inventory_EDIT_SHOW);
    localStorage.removeItem(IntroService.CASHIER_STATISTICS_SHOW);
  }
}
