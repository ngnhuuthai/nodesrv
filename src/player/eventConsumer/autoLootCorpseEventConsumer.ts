import {inject, injectable} from "inversify"
import {EventType} from "../../event/enum/eventType"
import {createRoomMessageEvent} from "../../event/factory/eventFactory"
import EventConsumer from "../../event/interface/eventConsumer"
import EventResponse from "../../event/messageExchange/eventResponse"
import EventService from "../../event/service/eventService"
import ResponseMessageBuilder from "../../messageExchange/builder/responseMessageBuilder"
import DeathEvent from "../../mob/event/deathEvent"
import LocationService from "../../mob/service/locationService"
import {Types} from "../../support/types"

@injectable()
export default class AutoLootCorpseEventConsumer implements EventConsumer {
  constructor(
    @inject(Types.EventService) private readonly eventService: EventService,
    @inject(Types.LocationService) private readonly locationService: LocationService) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.MobDeath ]
  }

  public async consume(event: DeathEvent): Promise<EventResponse> {
    const death = event.death
    const winner = death.killer
    if (winner && winner.isPlayerMob() && winner.playerMob.autoLoot) {
      const corpse = death.corpse
      const room = this.locationService.getRoomForMob(event.death.mobKilled)
      await Promise.all(corpse.container.inventory.items.map(async item => {
        winner.inventory.addItem(item)
        await this.eventService.publish(createRoomMessageEvent(
          room,
          new ResponseMessageBuilder(winner, "{requestCreator} {verb} from {corpse}.")
            .addReplacementForRequestCreator("verb", "loot")
            .addReplacementForTarget("verb", "loots")
            .addReplacement("corpse", corpse.toString())
            .create()))
      }))
    }
    return EventResponse.none(event)
  }
}
