import {createTestAppContainer} from "../../app/factory/testFactory"
import {EventResponseStatus} from "../../event/enum/eventResponseStatus"
import {EventType} from "../../event/enum/eventType"
import {createFightEvent} from "../../event/factory/eventFactory"
import EventConsumer from "../../event/interface/eventConsumer"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import LocationService from "../service/locationService"
import MobService from "../service/mobService"
import WimpyEventConsumer from "./wimpyEventConsumer"

describe("wimpy event consumer", () => {
  it("causes a weak mob to flee", async () => {
    // setup
    const app = await createTestAppContainer()
    const testRunner = app.get<TestRunner>(Types.TestRunner)
    const room1 = testRunner.getStartRoom()
    const room2 = testRunner.createRoom()
    const mob = (await testRunner.createMob()).get()
    const target = (await testRunner.createMob()).get()
    const fight = await testRunner.fight(target)
    const wimpy = app.getAll<EventConsumer>(Types.EventConsumerTable).find(eventConsumer =>
      eventConsumer instanceof WimpyEventConsumer) as WimpyEventConsumer

    // given
    target.traits.wimpy = true
    target.hp = 1

    // when
    let eventResponse: EventResponseStatus = EventResponseStatus.None
    while (eventResponse !== EventResponseStatus.Satisfied) {
      eventResponse = (await wimpy.consume(createFightEvent(EventType.AttackRound, mob, fight))).status
    }

    // then
    const locationService = app.get<LocationService>(Types.LocationService)
    expect(locationService.getRoomForMob(mob)).toBe(room1.get())
    expect(locationService.getRoomForMob(target)).toBe(room2.get())

    // and
    const mobService = app.get<MobService>(Types.MobService)
    mobService.filterCompleteFights()
    expect(mobService.findFightForMob(mob).get()).toBeUndefined()
  })
})
