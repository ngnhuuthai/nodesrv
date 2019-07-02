import {EventType} from "../../../event/enum/eventType"
import EventConsumer from "../../../event/eventConsumer"
import EventResponse from "../../../event/eventResponse"
import {createDestroyItemEvent} from "../../../event/factory/eventFactory"
import EventService from "../../../event/service/eventService"
import {MobEntity} from "../../../mob/entity/mobEntity"
import DamageEvent from "../../../mob/event/damageEvent"
import LocationService from "../../../mob/service/locationService"
import InputContext from "../../../request/context/inputContext"
import {RequestType} from "../../../request/enum/requestType"
import {ResponseStatus} from "../../../request/enum/responseStatus"
import Request from "../../../request/request"
import Response from "../../../request/response"
import ResponseMessage from "../../../request/responseMessage"
import ClientService from "../../../server/service/clientService"
import roll from "../../../support/random/dice"
import {ItemEntity} from "../../entity/itemEntity"
import {Equipment} from "../../enum/equipment"
import {MaterialType} from "../../enum/materialType"
import {WeaponEffect} from "../../enum/weaponEffect"

export default class FlamingWeaponEffectEventConsumer implements EventConsumer {
  constructor(
    private readonly eventService: EventService,
    private readonly locationService: LocationService,
    private readonly clientService: ClientService) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.DamageCalculation ]
  }

  public async consume(event: DamageEvent): Promise<EventResponse> {
    const equippedWeapon = event.source.getFirstEquippedItemAtPosition(Equipment.Weapon)
    if (equippedWeapon && equippedWeapon.weaponEffects.includes(WeaponEffect.Flaming)) {
      event.mob.equipped.items.forEach(async item => {
        if (item.material === MaterialType.Wood) {
          await this.calculateBurningEquipment(item, event.mob)
        }
      })
    }
    return EventResponse.none(event)
  }

  private async calculateBurningEquipment(item: ItemEntity, mob: MobEntity) {
    if (roll(1, 8) === 1) {
      await this.eventService.publish(createDestroyItemEvent(item))
      this.clientService.sendResponseToRoom(
        new Response(
          new Request(mob, this.locationService.getRoomForMob(mob), new InputContext(RequestType.Noop, "")),
          ResponseStatus.Info,
          new ResponseMessage(
            mob,
            "{item} catches fire and burns up as it falls off {target}.",
            { item },
            { item },
            { item })))
    }
  }
}
