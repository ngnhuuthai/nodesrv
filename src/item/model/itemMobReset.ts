import {Entity, JoinColumn, ManyToOne} from "typeorm"
import { Mob } from "../../mob/model/mob"
import ItemReset from "./itemReset"

@Entity()
export default class ItemMobReset extends ItemReset {
  @ManyToOne(() => Mob, { eager: true })
  @JoinColumn()
  public mob: Mob
}
