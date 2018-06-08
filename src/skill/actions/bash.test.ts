import { addFight, Fight, reset } from "../../mob/fight/fight"
import { Mob } from "../../mob/model/mob"
import { SkillType } from "../../skill/skillType"
import { getTestMob } from "../../test/mob"
import Attempt from "../attempt"
import { newSkill } from "../factory"
import bash, { MESSAGE_FAIL, MESSAGE_NO_SKILL, MESSAGE_NO_TARGET } from "./bash"

const RETRY_COUNT = 10

function createBashRequest(mob: Mob, target: Mob): Attempt {
  return new Attempt(mob, target, mob.skills.find((s) => s.skillType === SkillType.Bash))
}

function bashRepeater(mob: Mob, target: Mob) {
  return () => bash(createBashRequest(mob, target))
}

function times(count: number, callback) {
  return Array.from(Array(10).keys()).map((n) => callback())
}

function addNewTestFight(mob: Mob): Fight {
  const fight = new Fight(mob, getTestMob())
  addFight(fight)

  return fight
}

beforeEach(() => reset())

describe("bash", () => {
  it("should not work if a mob is not in combat", async () => {
    const outcome = await bash(createBashRequest(getTestMob(), null))
    expect(outcome.message).toEqual(MESSAGE_NO_TARGET)
  })

  it("should not work if a mob does not have the skill", async () => {
    // setup
    const mob = getTestMob()
    const fight = addNewTestFight(mob)

    // when
    const outcome = await bash(createBashRequest(mob, fight.target))

    // then
    expect(outcome.message).toEqual(MESSAGE_NO_SKILL)
  })

  it("should be able to trigger a failed bash", async () => {
    // setup
    const mob = getTestMob()
    mob.skills.push(newSkill(SkillType.Bash))
    const fight = addNewTestFight(mob)

    // when
    const outcomes = await Promise.all(times(RETRY_COUNT, bashRepeater(mob, fight.target)))

    // then
    expect(outcomes.some((result) => result.message === MESSAGE_FAIL)).toBeTruthy()
  })

  it("should be able to trigger a successful bash", async () => {
    // setup
    const mob = getTestMob()
    mob.skills.push(newSkill(SkillType.Bash, 100))
    const fight = addNewTestFight(mob)

    // when
    const outcomes = await Promise.all(times(RETRY_COUNT, bashRepeater(mob, fight.target)))

    // then
    expect(outcomes.some((result) => result.message.includes("You slam into"))).toBeTruthy()
  })
})
