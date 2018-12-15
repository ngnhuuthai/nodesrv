import {Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import * as v4 from "uuid"
import Recipe from "./recipe"

@Entity()
export default class Forge {
  @PrimaryGeneratedColumn()
  public id: number

  @Column("text")
  @Generated("uuid")
  public uuid: string = v4()

  @OneToMany(type => Recipe, recipe => recipe.forge)
  public recipes: Recipe[] = []
}
