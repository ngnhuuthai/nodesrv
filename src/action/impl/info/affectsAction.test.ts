import { AffectType } from "../../../affect/enum/affectType"
import {createTestAppContainer} from "../../../app/factory/testFactory"
import { RequestType } from "../../../messageExchange/enum/requestType"
import TestRunner from "../../../support/test/testRunner"
import {Types} from "../../../support/types"

describe("affects", () => {
  it("should report when an affect has added", async () => {
    // setup
    const testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)

    // given
    const mobBuilder = await testRunner.createMob()
    mobBuilder.addAffectType(AffectType.Noop, 1)
      .addAffectType(AffectType.Stunned, 2)

    // when
    const response = await testRunner.invokeAction(RequestType.Affects)
    const message = response.getMessageToRequestCreator()

    // then
    expect(message).toContain(AffectType.Noop)
    expect(message).toContain("hour\n")
    expect(message).toContain(AffectType.Stunned)
    expect(message).toContain("hours")
    expect(message).not.toContain(AffectType.Shield)
  })
})
