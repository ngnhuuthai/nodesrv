import { default as ItemReset } from "../item/model/itemReset"
import { default as MobReset } from "../mob/model/mobReset"
import MobService from "../mob/mobService"
import RoomTable from "../room/roomTable"
import { Mob } from "../mob/model/mob"

export default class ResetService {
  constructor(
    public readonly mobResets: MobReset[],
    public readonly itemResets: ItemReset[],
    private readonly mobService: MobService,
    private readonly roomTable: RoomTable) {}

  public async respawnFromMobReset(mobReset: MobReset): Promise<void> {
    const mob = await this.mobService.generateNewMobInstance(mobReset)
    const room = this.roomTable.get(mobReset.room.uuid)
    this.mobService.add(mob, room)
  }

  public async respawnFromItemReset(itemReset: ItemReset): Promise<void> {
    // const mob = await this.item
    // const room = this.roomTable.get(mobReset.room.uuid)
    // this.mobService.add(mob, room)
  }

  public async pruneDeadMobs() {
    return this.mobService.pruneDeadMobs()
  }

  public async seedMobTable() {
    await Promise.all(this.mobResets.map(this.respawnFromMobReset.bind(this)))
  }

  public async seedItemTable() {
    await Promise.all(this.itemResets.map(this.respawnFromItemReset.bind(this)))
  }

}
