import {EventType} from "../../event/enum/eventType"
import EventConsumer from "../../event/eventConsumer"
import EventResponse from "../../event/eventResponse"
import {MobEntity} from "../../mob/entity/mobEntity"
import FightEvent from "../../mob/fight/event/fightEvent"
import {AffectType} from "../enum/affectType"

export default class HasteEventConsumer implements EventConsumer {
  public getConsumingEventTypes(): EventType[] {
    return [EventType.AttackRound]
  }

  public async consume(event: FightEvent): Promise<EventResponse> {
    if (event.mob.affect().has(AffectType.Haste)) {
      const fight = event.fight
      event.attacks.push(await fight.attack(event.mob, fight.getOpponentFor(event.mob) as MobEntity))
    }
    return EventResponse.none(event)
  }
}
