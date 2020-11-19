import BaseModel from "./BaseModel";

export class AttackType extends BaseModel {
  static tableName = 'attackType';

  id!: number;
  name!: string;
}
