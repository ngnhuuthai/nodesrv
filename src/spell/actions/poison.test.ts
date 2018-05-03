import { AffectType } from "../../affect/affectType"
import { RequestType } from "../../handler/constants"
import { createRequestArgs, Request } from "../../server/request/request"
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
    const player = getTestPlayer()
    const target = getTestMob("bob")
    const room = getTestRoom()
    player.sessionMob.spells.push(newSpell(SpellType.Poison, 100))
    room.addMob(player.sessionMob)
    room.addMob(target)

    poison(new Check(
      new Request(player, RequestType.Cast, createRequestArgs("cast poison bob")),
      spellCollection.findSpell(SpellType.Poison)))

    expect(target.affects.length).toBe(1)
    expect(target.getAffect(AffectType.Poison)).toBeTruthy()
  })
})