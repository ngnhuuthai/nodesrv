import Skill from "../../../action/impl/skill"
import {EventType} from "../../../event/enum/eventType"
import EventConsumer from "../../../event/eventConsumer"
import EventResponse from "../../../event/eventResponse"
import EventContext from "../../../request/context/eventContext"
import {RequestType} from "../../../request/enum/requestType"
import Request from "../../../request/request"
import TickEvent from "../../event/tickEvent"

export default class FastHealingEventConsumer implements EventConsumer {
  constructor(private readonly fastHealing: Skill) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.Tick ]
  }

  public async consume(event: TickEvent): Promise<EventResponse> {
    const request = new Request(event.mob, event.room, {requestType: RequestType.Noop } as EventContext)
    await this.fastHealing.handle(request)
    return EventResponse.none(event)
  }
}