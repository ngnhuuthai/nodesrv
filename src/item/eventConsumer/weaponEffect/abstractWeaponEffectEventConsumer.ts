import {EventType} from "../../../event/enum/eventType"
import EventConsumer from "../../../event/eventConsumer"
import EventResponse from "../../../event/eventResponse"
import DamageEvent from "../../../mob/event/damageEvent"
import Maybe from "../../../support/functional/maybe"
import {ItemEntity} from "../../entity/itemEntity"
import {WeaponEffect} from "../../enum/weaponEffect"
import WeaponEffectService from "../../service/weaponEffectService"

export default abstract class AbstractWeaponEffectEventConsumer implements EventConsumer {
  constructor(protected readonly weaponEffectService: WeaponEffectService) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.DamageCalculation ]
  }

  public consume(event: DamageEvent): Promise<EventResponse> {
    return new Maybe(WeaponEffectService.getWeaponMatchingWeaponEffect(event.source, this.getWeaponEffect()))
      .do(async equippedWeapon => this.applyWeaponEffect(event, equippedWeapon))
      .or(() => EventResponse.none(event))
      .get()
  }

  public abstract getWeaponEffect(): WeaponEffect

  public abstract applyWeaponEffect(event: DamageEvent, weapon: ItemEntity): Promise<EventResponse>
}
