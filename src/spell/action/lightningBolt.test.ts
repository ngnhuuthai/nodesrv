import InputContext from "../../request/context/inputContext"
import { Request } from "../../request/request"
import { RequestType } from "../../request/requestType"
import { getTestMob } from "../../test/mob"
import { getTestPlayer } from "../../test/player"
import { getTestRoom } from "../../test/room"
import { Check } from "../check"
import spellTable from "../spellTable"
import { SpellType } from "../spellType"
import lightningBolt from "./lightningBolt"

describe("lightning bolt", () => {
  it("should do damage when casted", () => {
    // setup
    const player = getTestPlayer()
    const mob = getTestMob("bob")
    const room = getTestRoom()
    room.addMob(player.sessionMob)
    room.addMob(mob)
    expect(mob.vitals.hp).toBe(mob.getCombinedAttributes().vitals.hp)

    // when
    lightningBolt(
      new Check(
        new Request(player.sessionMob, new InputContext(RequestType.Cast, "cast 'lightning bolt' bob"), mob),
        spellTable.findSpell(SpellType.LightningBolt)))

    // then
    expect(mob.vitals.hp).toBeLessThan(mob.getCombinedAttributes().vitals.hp)
  })
})