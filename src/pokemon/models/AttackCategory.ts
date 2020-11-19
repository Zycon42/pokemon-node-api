import BaseModel from "./BaseModel";

export class AttackCategory extends BaseModel {
  static tableName = 'attackCategory';

  id!: number;
  name!: string;
}
