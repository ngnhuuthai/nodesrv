import { AffectType } from "../../affect/affectType"
import { Mob } from "../../mob/model/mob"
import { getMultipleOutcomes } from "../../test/repeater"
import { newSkill } from "../factory"
import { SkillType } from "../skillType"
import berserk from "./berserk"

describe("berserk skill action", () => {
  it("should be able to fail berserking", async () => {
    // given
    const mob = new Mob()
    const skill = newSkill(SkillType.Berserk)

    // when
    const outcomes = await getMultipleOutcomes(mob, skill, berserk)

    // then
    expect(outcomes.some((outcome) => !outcome.wasSuccessful())).toBeTruthy()
    expect(mob.getAffect(AffectType.Berserk)).toBeFalsy()
  })

  it("should be able to succeed berserking", async () => {
    // given
    const mob = new Mob()
    const skill = newSkill(SkillType.Berserk, 100)

    // when
    const outcomes = await getMultipleOutcomes(mob, skill, berserk)

    // then
    expect(outcomes.some((outcome) => outcome.wasSuccessful())).toBeTruthy()
    expect(mob.getAffect(AffectType.Berserk)).toBeTruthy()
  })
})