import EventConsumer from "../../../../event/eventConsumer"
import EventResponse from "../../../../event/eventResponse"
import {EventType} from "../../../../event/eventType"
import GameService from "../../../../gameService/gameService"
import {MAX_PRACTICE_LEVEL} from "../../../../mob/constants"
import MobService from "../../../../mob/mobService"
import {RequestType} from "../../../../request/requestType"
import RoomMessageEvent from "../../../../room/event/roomMessageEvent"
import {SpellType} from "../../../../spell/spellType"
import MobBuilder from "../../../../support/test/mobBuilder"
import RoomBuilder from "../../../../support/test/roomBuilder"
import TestBuilder from "../../../../support/test/testBuilder"

let testBuilder: TestBuilder
let target: MobBuilder
let room1: RoomBuilder
let room2: RoomBuilder
let mobService: MobService
let service: GameService
const responseMessage = "you arrive in a puff of smoke!"

beforeEach(async () => {
  testBuilder = new TestBuilder()
  room1 = testBuilder.withRoom()
  testBuilder.withMob().addToRoom(room1)
    .withSpell(SpellType.Summon, MAX_PRACTICE_LEVEL)
    .setLevel(30)
  room2 = testBuilder.withRoom()
  target = testBuilder.withMob().addToRoom(room2)
  service = await testBuilder.getService()
  mobService = service.mobService
})

describe("summon spell action", () => {
  it("summons a mob when able", async () => {
    // when
    await testBuilder.successfulAction(
      testBuilder.createRequest(RequestType.Cast, `cast 'summon' ${target.getMobName()}`))

    // then
    expect(mobService.locationService.getMobsByRoom(room1.room)).toHaveLength(2)
  })

  it("generates accurate success messages when casting on a target", async () => {
    // when
    const response = await testBuilder.successfulAction(
      testBuilder.createRequest(RequestType.Cast, `cast 'summon' ${target.getMobName()}`))

    // then
    expect(response.getMessageToRequestCreator()).toBe(`${target.getMobName()} arrives in a puff of smoke!`)
    expect(response.message.getMessageToTarget()).toBe(responseMessage)
    expect(response.message.getMessageToObservers()).toBe(`${target.getMobName()} arrives in a puff of smoke!`)
  })

  it("generates accurate success messages in the target room", async () => {
    const testConsumer = class implements EventConsumer {
      public messages: RoomMessageEvent[] = []

      public consume(event: RoomMessageEvent): Promise<EventResponse> {
        this.messages.push(event)
        return EventResponse.none(event)
      }

      public getConsumingEventTypes(): EventType[] {
        return [ EventType.RoomMessage ]
      }
    }

    const consumer = new testConsumer()
    service.addEventConsumer(consumer)

    // when
    await testBuilder.successfulAction(
      testBuilder.createRequest(RequestType.Cast, `cast 'summon' ${target.getMobName()}`))

    // then
    expect(consumer.messages).toHaveLength(1)

    const response = consumer.messages[0]

    expect(response.message.getMessageToRequestCreator()).toBe("you disappear in a puff of smoke!")
    expect(response.message.getMessageToTarget()).toBe("you disappear in a puff of smoke!")
    expect(response.message.getMessageToObservers()).toBe(`${target.getMobName()} disappears in a puff of smoke!`)
  })
})
