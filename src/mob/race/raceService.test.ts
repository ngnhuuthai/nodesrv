import {newEmptyAttributes} from "../../attributes/factory/attributeFactory"
import {getTestMob} from "../../support/test/mob"
import {getTestPlayer} from "../../support/test/player"
import {RaceType} from "./enum/raceType"
import RaceService from "./raceService"
import raceTable from "./raceTable"

describe("race service", () => {
  it("gives a mob a race type", () => {
    // given
    const mob = getTestMob()

    // when
    RaceService.assignRaceToMob(mob, RaceType.Ogre)

    // then
    expect(mob.raceType).toBe(RaceType.Ogre)
  })

  it("nourishes a player mob", () => {
    // given
    const player = getTestPlayer()

    // when
    RaceService.assignRaceToMob(player.sessionMob, RaceType.Ogre)

    // then
    expect(player.sessionMob.playerMob.hunger).toBe(player.sessionMob.playerMob.appetite)
  })

  it("imparts racial skills", () => {
    // given
    const mob = getTestMob()

    // when
    RaceService.assignRaceToMob(mob, RaceType.Ogre)

    // then
    expect(mob.skills).toHaveLength(mob.race().startingSkills.length)
  })

  it("combines attributes with a race", () => {
    // setup
    const mob = getTestMob()

    // given
    RaceService.assignRaceToMob(mob, RaceType.Ogre)

    // when
    const attributes = RaceService.combineAttributes(mob, newEmptyAttributes())

    // then
    expect(attributes.str).toBe(mob.race().attributes.str)
  })

  it("requires hitroll in order to be complete", () => {
    raceTable.forEach(race => {
      expect(race.attributes.hit).toBeGreaterThan(0)
      expect(race.attributes.dam).toBeGreaterThan(0)
    })
  })
})
