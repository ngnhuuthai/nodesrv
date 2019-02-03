import { MAX_PRACTICE_LEVEL } from "../../mob/constants"
import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import { SpellType } from "../spellType"

describe.skip("lightning bolt", () => {
  it("should do damage when casted", async () => {
    // setup
    const testBuilder = new TestBuilder()
    const mobBuilder1 = testBuilder.withMob()
    mobBuilder1.withLevel(30)
    mobBuilder1.withSpell(SpellType.LightningBolt, MAX_PRACTICE_LEVEL)
    const mobBuilder2 = testBuilder.withMob("bob")
    const mob = mobBuilder2.mob
    const definition = await testBuilder.getSpellDefinition(SpellType.LightningBolt)

    // when
    const response = await definition.doAction(testBuilder.createRequest(RequestType.Cast, "cast lightning bob", mob))

    // then
    expect(response.isSuccessful()).toBeTruthy()
    expect(mob.vitals.hp).toBeLessThan(mob.getCombinedAttributes().vitals.hp)
  })
})
