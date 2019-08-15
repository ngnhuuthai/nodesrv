import Skill from "../../../action/impl/skill"
import {EventType} from "../../../event/enum/eventType"
import EventConsumer from "../../../event/interface/eventConsumer"
import EventResponse from "../../../event/messageExchange/eventResponse"
import EventContext from "../../../messageExchange/context/eventContext"
import {RequestType} from "../../../messageExchange/enum/requestType"
import Request from "../../../messageExchange/request"
import FightEvent from "../../fight/event/fightEvent"

export default class ExtraAttackEventConsumer implements EventConsumer {
  constructor(private readonly skill: Skill) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.AttackRound ]
  }

  public async consume(event: FightEvent): Promise<EventResponse> {
    if (!event.mob.skills.find(skill => skill.skillType === this.skill.getSkillType())) {
      return EventResponse.none(event)
    }
    const fight = event.fight
    const result = await this.skill.handle(
      new Request(event.mob, fight.room, { requestType: RequestType.Noop , event } as EventContext))
    if (result.isSuccessful()) {
      event.attacks.push(await fight.attack(event.mob, fight.getOpponentFor(event.mob)))
    }
    return EventResponse.none(event)
  }
}
