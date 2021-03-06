import {createTestAppContainer} from "../../app/factory/testFactory"
import {createTickEvent} from "../../event/factory/eventFactory"
import EventService from "../../event/service/eventService"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import {Disposition} from "../enum/disposition"
import LocationService from "../service/locationService"
import DeathTimerEventConsumer from "./deathTimerEventConsumer"

describe("death timer event consumer", () => {
  it("should make a mob dead if it has a death timer", async () => {
    // setup
    const app = await createTestAppContainer()
    const testRunner = app.get<TestRunner>(Types.TestRunner)
    const eventService = app.get<EventService>(Types.EventService)
    const locationService = app.get<LocationService>(Types.LocationService)

    // given
    const mob = (await testRunner.createMob()).get()
    mob.deathTimer = 1

    // when
    const eventConsumer = new DeathTimerEventConsumer(eventService)
    await eventConsumer.consume(createTickEvent(mob, locationService.getRoomForMob(mob), 0))

    // then
    expect(mob.deathTimer).toBe(0)
    expect(mob.disposition).toBe(Disposition.Dead)
  })
})
