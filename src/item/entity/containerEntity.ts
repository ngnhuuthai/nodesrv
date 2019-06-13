import { Column, Entity, Generated, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import * as v4 from "uuid"
import { InventoryEntity } from "./inventoryEntity"
import { ItemEntity } from "./itemEntity"

@Entity()
export default class ContainerEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column("text")
  @Generated("uuid")
  public uuid: string = v4()

  @Column("boolean")
  public isOpen: boolean = false

  @Column("boolean", { nullable: true })
  public isCloseable: boolean = false

  @Column("integer")
  public weightCapacity: number = 0

  @Column("integer")
  public itemCapacity: number = 0

  @Column("integer")
  public maxWeightForItem: number = 0

  @OneToOne(() => InventoryEntity, { eager: true, cascade: true })
  @JoinColumn()
  public inventory: InventoryEntity

  public addItem(item: ItemEntity, carriedBy?: any) {
    this.inventory.addItem(item)
    item.carriedBy = carriedBy
  }

  public getItemFrom(item: ItemEntity, inventory: InventoryEntity) {
    this.inventory.getItemFrom(item, inventory)
  }

  public toString(): string {
    return this.inventory.items.reduce((previous, current) => `${previous}\n${current.name}`, "")
  }
}