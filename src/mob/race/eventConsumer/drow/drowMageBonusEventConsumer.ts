import { injectable, multiInject } from "inversify"
import Spell from "../../../../action/impl/spell"
import {EventType} from "../../../../event/enum/eventType"
import {createModifiedCastEvent} from "../../../../event/factory/eventFactory"
import EventConsumer from "../../../../event/interface/eventConsumer"
import EventResponse from "../../../../event/messageExchange/eventResponse"
import {Types} from "../../../../support/types"
import CastEvent from "../../../event/castEvent"
import {SpecializationType} from "../../../specialization/enum/specializationType"
import {RaceType} from "../../enum/raceType"

@injectable()
export default class DrowMageBonusEventConsumer implements EventConsumer {
  public static bonusModifier = 3

  constructor(@multiInject(Types.Spells) private readonly spellTable: Spell[]) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.Cast ]
  }

  public async isEventConsumable(event: CastEvent): Promise<boolean> {
    const spell = this.spellTable.find(sp =>
      sp.getSpellType() === event.spell.spellType) as Spell
    return event.mob.raceType === RaceType.Drow &&
      event.mob.specializationType === SpecializationType.Mage &&
      spell.getSpecializationType() === SpecializationType.Mage
  }

  public consume(castEvent: CastEvent): Promise<EventResponse> {
    const spell = this.spellTable.find(sp =>
      sp.getSpellType() === castEvent.spell.spellType) as Spell
    if (castEvent.mob.raceType === RaceType.Drow &&
      castEvent.mob.specializationType === SpecializationType.Mage &&
      spell.getSpecializationType() === SpecializationType.Mage) {
      return EventResponse.modified(
        createModifiedCastEvent(castEvent, castEvent.roll + DrowMageBonusEventConsumer.bonusModifier))
    }

    return EventResponse.none(castEvent)
  }
}
