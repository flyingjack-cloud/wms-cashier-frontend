export interface Authority {
  authority: Role | Permission;
}

export enum Role{
  DEFAULT = "ROLE_DEFAULT", OWNER = "ROLE_OWNER", STAFF = "ROLE_STAFF", BLANK = ""
}

export enum Permission{
  SHOPPING = "PERMISSION:shopping", INVENTORY = "PERMISSION:inventory", STATISTICS = "PERMISSION:statistic"
}
