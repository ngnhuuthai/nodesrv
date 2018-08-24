import { AffectType } from "../../affect/affectType"
import Table from "../../mob/table"
import RequestBuilder from "../../request/requestBuilder"
import { RequestType } from "../../request/requestType"
import { getTestMob } from "../../test/mob"
import { getTestPlayer } from "../../test/player"
import { getTestRoom } from "../../test/room"
import { Check } from "../check"
import { newSpell } from "../factory"
import spellCollection from "../spellCollection"
import { SpellType } from "../spellType"
import poison from "./poison"

describe("poison", () => {
  it("casting poison should add the poison affect to the target", () => {
    // setup
    const player = getTestPlayer()
    const target = getTestMob("bob")
    const room = getTestRoom()
    player.sessionMob.spells.push(newSpell(SpellType.Poison, 100))
    room.addMob(player.sessionMob)
    room.addMob(target)
    const requestBuilder = new RequestBuilder(player, new Table(room.mobs))

    poison(new Check(
      requestBuilder.create(RequestType.Cast, "cast poison bob"),
      spellCollection.findSpell(SpellType.Poison)))

    expect(target.affects.length).toBe(1)
    expect(target.getAffect(AffectType.Poison)).toBeTruthy()
  })
})
