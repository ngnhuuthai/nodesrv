import {createTestAppContainer} from "../../../app/factory/testFactory"
import {RequestType} from "../../../messageExchange/enum/requestType"
import {Disposition} from "../../../mob/enum/disposition"
import TestRunner from "../../../support/test/testRunner"
import {Types} from "../../../support/types"
import {ConditionMessages} from "../../constants"

let testRunner: TestRunner

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
})

describe("sleep action", () => {
  it("should change the mob's disposition to sleeping", async () => {
    // given
    const mobBuilder = await testRunner.createMob()

    // when
    const response = await testRunner.invokeAction(RequestType.Sleep)

    // then
    expect(response.getMessageToRequestCreator()).toBe("you lay down and go to sleep.")
    expect(response.getMessageToTarget()).toBe("you lay down and go to sleep.")
    expect(response.getMessageToObservers()).toBe(`${mobBuilder.getMobName()} lays down and goes to sleep.`)
    expect(mobBuilder.mob.disposition).toBe(Disposition.Sleeping)
  })

  it("should not be able to sleep if already sleeping", async () => {
    // given
    (await testRunner.createMob()).withDisposition(Disposition.Sleeping)

    // when
    const response = await testRunner.invokeAction(RequestType.Sleep)

    // then
    expect(response.isError()).toBeTruthy()
    expect(response.getMessageToRequestCreator()).toBe(ConditionMessages.Sleep.AlreadySleeping)
  })

  it("provides accurate help text", async () => {
    // when
    const response = await testRunner.invokeAction(RequestType.Help, "help sleep")

    // then
    expect(response.getMessageToRequestCreator()).toBe(`Help:
command: sleep
syntax: sleep
These commands change your position.  When you SIT or SLEEP, you
regenerate hit points, mana points, and movement points faster.
However, you are more vulnerable to attack, and if you SLEEP,
you won't hear many things happen.

Use WAKE to come back to a standing position.  You can
also WAKE other sleeping characters.`)
  })
})
