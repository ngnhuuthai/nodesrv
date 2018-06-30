import { Player } from "../../player/model/player"
import { createRequestArgs, Request } from "../../request/request"
import { RequestType } from "../../request/requestType"
import { getTestMob } from "../../test/mob"
import { getTestPlayer } from "../../test/player"
import kill, { ATTACK_MOB } from "./kill"
import CheckedRequest from "../checkedRequest"
import Check, { CheckStatus } from "../check"
import { ResponseStatus } from "../../request/responseStatus"
import TestBuilder from "../../test/testBuilder"

function useKillRequest(player: Player, target, input: string) {
  return kill(new CheckedRequest(
    new Request(player, RequestType.Kill, createRequestArgs(input)),
    new Check(CheckStatus.Ok, target)))
}

describe("kill", () => {
  it("should be able to kill a mob in the same room", async () => {
    // given
    const testBuilder = new TestBuilder()
    const player = testBuilder.withPlayer().player
    const target = testBuilder.withMob("bob").mob

    // when
    const response = await useKillRequest(player, target, `kill ${target.name}`)

    // then
    expect(response.status).toBe(ResponseStatus.Success)
    expect(response.message).toBe(ATTACK_MOB)
  })
})
