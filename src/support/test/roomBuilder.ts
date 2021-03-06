import {ItemEntity} from "../../item/entity/itemEntity"
import {MobEntity} from "../../mob/entity/mobEntity"
import {RegionEntity} from "../../region/entity/regionEntity"
import DoorEntity from "../../room/entity/doorEntity"
import {ExitEntity} from "../../room/entity/exitEntity"
import { RoomEntity } from "../../room/entity/roomEntity"
import {Direction} from "../../room/enum/direction"

export default class RoomBuilder {
  constructor(public readonly room: RoomEntity) {}

  public setGroup(groupName: string): RoomBuilder {
    this.room.groupName = groupName
    return this
  }

  public getGroup(): string {
    return this.room.groupName
  }

  public setArea(area: string): RoomBuilder {
    this.room.area = area
    return this
  }

  public setRegion(region: RegionEntity): RoomBuilder {
    this.room.region = region
    return this
  }

  public setName(name: string): RoomBuilder {
    this.room.name = name
    return this
  }

  public makeOwnable(): RoomBuilder {
    this.room.isOwnable = true
    return this
  }

  public setOwner(mob: MobEntity): RoomBuilder {
    this.room.owner = mob
    return this
  }

  public addDoor(door: DoorEntity, direction: Direction = this.room.exits[0].direction): RoomBuilder {
    const exit = this.room.exits.find(e => e.direction === direction) as ExitEntity
    exit.door = door
    return this
  }

  public addItem(item: ItemEntity): RoomBuilder {
    this.room.inventory.addItem(item, this.room)
    return this
  }

  public getItemCount(): number {
    return this.room.inventory.items.length
  }

  public get(): RoomEntity {
    return this.room
  }
}
