import {createTestAppContainer} from "../../app/testFactory"
import InputEvent from "../../client/event/inputEvent"
import {RequestType} from "../../request/requestType"
import MobBuilder from "../../support/test/mobBuilder"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import {AffectType} from "../affectType"
import HolySilenceEventConsumer from "./holySilenceEventConsumer"

let testRunner: TestRunner
let consumer: HolySilenceEventConsumer
let caster: MobBuilder

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
  consumer = new HolySilenceEventConsumer()
  caster = testRunner.createMob()
  testRunner.fight()
})

describe("holy silence event consumer", () => {
  it("does nothing if a mob is not affected", async () => {
    // when
    const eventResponse = await consumer.consume(
      new InputEvent(
        caster.get(),
        testRunner.createRequest(RequestType.Cast, "cast holy"),
        jest.fn()()))

    // then
    expect(eventResponse.isSatisifed()).toBeFalsy()
  })

  it("satisfies event if caster is affected", async () => {
    // setup
    caster.addAffectType(AffectType.HolySilence)

    // when
    const eventResponse = await consumer.consume(
      new InputEvent(caster.mob, testRunner.createRequest(RequestType.Cast), jest.fn()()))

    // then
    expect(eventResponse.isSatisifed()).toBeTruthy()
  })
})
