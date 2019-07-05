import {inject, injectable} from "inversify"
import {createDestroyItemEvent} from "../../event/factory/eventFactory"
import EventService from "../../event/service/eventService"
import {MobEntity} from "../../mob/entity/mobEntity"
import {DamageType} from "../../mob/fight/enum/damageType"
import LocationService from "../../mob/service/locationService"
import ResponseBuilder from "../../request/builder/responseBuilder"
import ResponseMessage from "../../request/responseMessage"
import ClientService from "../../server/service/clientService"
import {Types} from "../../support/types"
import {ItemEntity} from "../entity/itemEntity"

@injectable()
export default class WeaponEffectService {
  public static findDamageAbsorption(mob: MobEntity, damageType: DamageType) {
    return mob.race().damageAbsorption.find(damage => damage.damageType === damageType)
  }

  constructor(
    @inject(Types.EventService) private readonly eventService: EventService,
    @inject(Types.LocationService) private readonly locationService: LocationService,
    @inject(Types.ClientService) private readonly clientService: ClientService) {}

  public sendMessageToMobRoom(mob: MobEntity, responseMessage: ResponseMessage) {
    const room = this.locationService.getRoomForMob(mob)
    this.clientService.sendResponseToRoom(ResponseBuilder.createResponse(
      mob,
      room,
      responseMessage))
  }

  public async destroyItemOnMob(mob: MobEntity, item: ItemEntity) {
    await this.eventService.publish(createDestroyItemEvent(item))
    const room = this.locationService.getRoomForMob(mob)
    if (item.isContainer()) {
      item.container.inventory.items.forEach(i =>
        room.inventory.addItem(i))
    }
  }
}