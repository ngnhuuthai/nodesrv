import {createTestAppContainer} from "../../app/factory/testFactory"
import {createAttackEvent} from "../../event/factory/eventFactory"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import {AffectType} from "../enum/affectType"
import DetectTouchEventConsumer from "./detectTouchEventConsumer"

let testRunner: TestRunner
let mockEventService: any
let eventConsumer: DetectTouchEventConsumer

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
  const mock = jest.fn(() => {
    return {
      publish: jest.fn(),
    }
  })
  mockEventService = mock()
  eventConsumer = new DetectTouchEventConsumer(mockEventService)
})

describe("detect touch event consumer", () => {
  it("publishes an event when a touch happens", async () => {
    // given
    const attacker = await testRunner.createMob()
    const defender = (await testRunner.createMob()).addAffectType(AffectType.DetectTouch)

    // when
    await eventConsumer.consume(createAttackEvent(attacker.mob, defender.mob))

    // then
    expect(mockEventService.publish.mock.calls.length).toBe(1)
  })
})
