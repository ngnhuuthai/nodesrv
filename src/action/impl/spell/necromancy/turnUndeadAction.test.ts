import {createTestAppContainer} from "../../../../app/factory/testFactory"
import {RequestType} from "../../../../messageExchange/enum/requestType"
import {MAX_PRACTICE_LEVEL} from "../../../../mob/constants"
import {Disposition} from "../../../../mob/enum/disposition"
import {RaceType} from "../../../../mob/race/enum/raceType"
import {SpellType} from "../../../../mob/spell/spellType"
import doNTimes from "../../../../support/functional/times"
import TestRunner from "../../../../support/test/testRunner"
import {Types} from "../../../../support/types"

let testRunner: TestRunner
const undeadCount = 10

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
  const mob = await testRunner.createMob()
  mob.withSpell(SpellType.TurnUndead, MAX_PRACTICE_LEVEL)
    .setLevel(30)
})

describe("turn undead action", () => {
  it("kills undead mobs", async () => {
    // given
    const mobs = await doNTimes(undeadCount, async () => (await testRunner.createMob()).setRace(RaceType.Undead))

    // when
    await testRunner.invokeActionSuccessfully(RequestType.Cast, "cast turn")

    // then
    expect(mobs.filter(mobBuilder => mobBuilder.mob.disposition === Disposition.Dead).length).toBeGreaterThan(0)
  })

  it("does not kill mobs who are not undead", async () => {
    // given
    const mobs = await doNTimes(undeadCount, () => testRunner.createMob())

    // when
    await testRunner.invokeActionSuccessfully(RequestType.Cast, "cast turn")

    // then
    expect(mobs.filter(mob => mob.disposition === Disposition.Dead)).toHaveLength(0)
  })
})
