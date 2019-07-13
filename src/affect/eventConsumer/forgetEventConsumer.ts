import {EventType} from "../../event/enum/eventType"
import {createSkillEvent} from "../../event/factory/eventFactory"
import EventConsumer from "../../event/interface/eventConsumer"
import EventResponse from "../../event/messageExchange/eventResponse"
import SkillEvent from "../../mob/skill/event/skillEvent"
import {percentRoll} from "../../support/random/helpers"
import {AffectType} from "../enum/affectType"

export default class ForgetEventConsumer implements EventConsumer {
  public getConsumingEventTypes(): EventType[] {
    return [EventType.SkillInvoked]
  }

  public async consume(event: SkillEvent): Promise<EventResponse> {
    if (event.mob.affect().has(AffectType.Forget) && event.skill.level / 2 < percentRoll()) {
      return EventResponse.modified(createSkillEvent(event.skill, event.mob, false))
    }
    return EventResponse.none(event)
  }
}
