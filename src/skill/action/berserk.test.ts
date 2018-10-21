import { AffectType } from "../../affect/affectType"
import { all } from "../../functional/collection"
import doNTimes from "../../functional/times"
import { MAX_PRACTICE_LEVEL } from "../../mob/constants"
import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import { Messages } from "../constants"
import SkillDefinition from "../skillDefinition"
import { getSkillActionDefinition } from "../skillTable"
import { SkillType } from "../skillType"

const iterations = 10
let testBuilder: TestBuilder
const definition: SkillDefinition = getSkillActionDefinition(SkillType.Berserk)

beforeEach(() => {
  testBuilder = new TestBuilder()
})

async function action() {
  return definition.action(
    await testBuilder.createCheckedRequestFrom(RequestType.Berserk, definition.preconditions))
}

describe("berserk skill action", () => {
  it("should be able to fail berserking", async () => {
    // given
    const mobBuilder = testBuilder.withMob()
    mobBuilder.withSkill(SkillType.Berserk)

    // when
    const responses = await doNTimes(iterations, () => action())

    // then
    expect(all(responses, response => !response.isSuccessful())).toBeTruthy()
    expect(all(responses, response => response.result === Messages.Berserk.Fail))
    expect(mobBuilder.mob.getAffect(AffectType.Berserk)).toBeFalsy()
  })

  it("should be able to succeed berserking", async () => {
    // given
    const mobBuilder = testBuilder.withMob()
    mobBuilder.withSkill(SkillType.Berserk, MAX_PRACTICE_LEVEL)

    // when
    const responses = await doNTimes(iterations, () => action())

    // then
    expect(responses.some(response => response.isSuccessful())).toBeTruthy()
    expect(mobBuilder.mob.getAffect(AffectType.Berserk)).toBeTruthy()
  })
})