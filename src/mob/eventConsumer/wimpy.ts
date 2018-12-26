import {Definition} from "../../action/definition/definition"
import MobEvent from "../../event/event/mobEvent"
import EventConsumer from "../../event/eventConsumer"
import {EventResponse} from "../../event/eventResponse"
import {EventType} from "../../event/eventType"
import EventContext from "../../request/context/eventContext"
import {Request} from "../../request/request"
import {RequestType} from "../../request/requestType"
import {Trigger} from "../enum/trigger"
import {Fight} from "../fight/fight"
import LocationService from "../locationService"
import {Mob} from "../model/mob"

export default class Wimpy implements EventConsumer {
  private static isWimpy(mob: Mob, target: Mob) {
    return target.vitals.hp / target.getCombinedAttributes().vitals.hp < 0.2 || target.level < mob.level - 8
  }

  constructor(
    private readonly locationService: LocationService,
    private readonly fleeDefinition: Definition) {}

  public getConsumingEventTypes(): EventType[] {
    return [EventType.AttackRound]
  }

  public async consume(event: MobEvent): Promise<EventResponse> {
    const fight = event.context as Fight
    const target = fight.getOpponentFor(event.mob)
    if (target.traits.wimpy && Wimpy.isWimpy(event.mob, target)) {
      const response = await this.tryWimpy(target)
      if (response.isSuccessful()) {
        return Promise.resolve(EventResponse.Satisfied)
      }
    }
    return Promise.resolve(EventResponse.None)
  }

  private tryWimpy(mob: Mob) {
    return this.fleeDefinition.handle(
      new Request(
        mob,
        this.locationService.getLocationForMob(mob).room,
        new EventContext(RequestType.Flee, Trigger.AttackRound)))
  }
}