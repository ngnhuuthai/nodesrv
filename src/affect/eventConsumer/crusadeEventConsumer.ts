import { injectable } from "inversify"
import {EventType} from "../../event/enum/eventType"
import EventConsumer from "../../event/interface/eventConsumer"
import EventResponse from "../../event/messageExchange/eventResponse"
import FightEvent from "../../mob/fight/event/fightEvent"
import roll from "../../support/random/dice"
import {AffectType} from "../enum/affectType"

@injectable()
export default class CrusadeEventConsumer implements EventConsumer {
  public getConsumingEventTypes(): EventType[] {
    return [EventType.AttackRound]
  }

  public async isEventConsumable(event: FightEvent): Promise<boolean> {
    return event.mob.affect().has(AffectType.Crusade) && roll(1, 2) === 1
  }

  public async consume(event: FightEvent): Promise<EventResponse> {
    const fight = event.fight
    event.attacks.push(await fight.createAttack(event.mob, fight.getOpponentFor(event.mob)))
    return EventResponse.none(event)
  }
}
