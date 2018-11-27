import { newItemRoomReset } from "../../item/factory"
import ContainerRepository from "../../item/repository/container"
import ItemRepository from "../../item/repository/item"
import ItemRoomResetRepository from "../../item/repository/itemRoomReset"
import { newMobReset } from "../../mob/factory"
import MobRepository from "../../mob/repository/mob"
import MobResetRepository from "../../mob/repository/mobReset"
import RoomRepository from "../../room/repository/room"
import { ResetFlag } from "../enum/resetFlag"
import File from "../file"
import Reset from "../reset"

export default class ResetImportService {
  constructor(
    public readonly mobResetRepository: MobResetRepository,
    public readonly itemRoomResetRepository: ItemRoomResetRepository,
    public readonly mobRepository: MobRepository,
    public readonly itemRepository: ItemRepository,
    public readonly roomRepository: RoomRepository,
    public readonly containerRepository: ContainerRepository,
  ) {}

  public async materializeResets(file: File) {
    for (const reset of file.resets) {
      switch (reset.resetFlag) {
        case ResetFlag.Mob:
          await this.createMobRoomReset(reset)
          break
        case ResetFlag.Item:
          await this.createItemRoomReset(reset)
          break
        case ResetFlag.GiveItemToMob:
          // await this.createItemMobReset(reset)
          break
        case ResetFlag.EquipItemToMob:
          // await this.createItemEquipReset(reset)
          break
        case ResetFlag.PutItemInContainer:
          // await this.createItemContainerReset(reset)
          break
        case ResetFlag.Door:
          break
        case ResetFlag.RandomRoomExits:
          break
        default:
          break
      }
    }
  }

  private async createMobRoomReset(reset: Reset) {
    const room = await this.roomRepository.findOneByImportId(reset.idOfResetDestination)
    const mob = await this.mobRepository.findOneByImportId(reset.idOfResetSubject)
    if (!room) {
      return
    }
    if (!mob) {
      return
    }
    await this.mobResetRepository.save(newMobReset(mob, room))
  }

  private async createItemRoomReset(reset: Reset) {
    const room = await this.roomRepository.findOneByImportId(reset.idOfResetDestination)
    const item = await this.itemRepository.findOneByImportId(reset.idOfResetSubject)
    if (!room) {
      return
    }
    if (!item) {
      return
    }
    await this.itemRoomResetRepository.save(newItemRoomReset(item, room))
  }
}