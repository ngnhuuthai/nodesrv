import {EventType} from "../../event/enum/eventType"
import EventConsumer from "../../event/eventConsumer"
import EventResponse from "../../event/eventResponse"
import {createSkillEvent} from "../../event/factory"
import SkillEvent from "../../skill/event/skillEvent"
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
