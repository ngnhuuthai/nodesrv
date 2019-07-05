import EventResponse from "../../../event/eventResponse"
import DamageEvent from "../../../mob/event/damageEvent"
import ResponseMessage from "../../../request/responseMessage"
import roll from "../../../support/random/dice"
import {ItemEntity} from "../../entity/itemEntity"
import {WeaponEffect} from "../../enum/weaponEffect"
import AbstractWeaponEffectEventConsumer from "./abstractWeaponEffectEventConsumer"
import {WeaponEffectMessages} from "./constants"

export default class VampiricWeaponEffectEventConsumer extends AbstractWeaponEffectEventConsumer {
  public getWeaponEffect(): WeaponEffect {
    return WeaponEffect.Vampiric
  }

  public applyWeaponEffect(event: DamageEvent, weapon: ItemEntity): Promise<EventResponse> {
    const amount = roll(2, event.amount / 3)
    event.mob.hp -= amount
    event.source.hp += amount
    this.weaponEffectService.sendMessageToMobRoom(
      event.mob,
      new ResponseMessage(
        event.mob,
        WeaponEffectMessages.Vampiric.VampiricStrike,
        { item: weapon, target: event.mob },
        { item: weapon, target: "you" },
        { item: weapon, target: event.mob }))
    return EventResponse.none(event)
  }
}
