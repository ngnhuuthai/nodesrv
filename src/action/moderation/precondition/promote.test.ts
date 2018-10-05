import { CheckStatus } from "../../../check/checkStatus"
import { Standing } from "../../../mob/standing"
import { AuthorizationLevel } from "../../../player/authorizationLevel"
import { allAuthorizationLevels } from "../../../player/constants"
import { Player } from "../../../player/model/player"
import RequestBuilder from "../../../request/requestBuilder"
import { RequestType } from "../../../request/requestType"
import Service from "../../../service/service"
import { getTestMob } from "../../../test/mob"
import TestBuilder from "../../../test/testBuilder"
import {
  MESSAGE_FAIL_BANNED,
  MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS,
  MESSAGE_FAIL_CANNOT_PROMOTE_SELF,
  MESSAGE_FAIL_NOT_AUTHORIZED,
} from "./constants"
import { MESSAGE_FAIL_NOT_PLAYER } from "./constants"
import promote from "./promote"

const MOB_TO_BAN = "bob"
const MOB_SELF = "alice"
let requestBuilder: RequestBuilder
let service: Service
let player: Player
let playerToPromote: Player

describe("promote moderation precondition", () => {
  beforeEach(async () => {
    const testBuilder = new TestBuilder()
    const adminPlayerBuilder = await testBuilder.withAdminPlayer(AuthorizationLevel.Immortal)
    player = adminPlayerBuilder.player
    player.sessionMob.name = MOB_SELF
    const playerBuilder = await testBuilder.withPlayer()
    playerToPromote = playerBuilder.player
    playerToPromote.sessionMob.name = MOB_TO_BAN
    service = await testBuilder.getService()
    service.mobTable.add(player.sessionMob)
    service.mobTable.add(playerToPromote.sessionMob)
    requestBuilder = new RequestBuilder(player, service.mobTable)
  })

  it("should not be able to promote if not an immortal", async () => {
    return await Promise.all(
      allAuthorizationLevels.filter((auth) => auth !== AuthorizationLevel.Immortal)
        .map(async (authorizationLevel) => {
      player.sessionMob.playerMob.authorizationLevel = authorizationLevel
      const check = await promote(
        requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`), service)
      expect(check.status).toBe(CheckStatus.Failed)
      expect(check.result).toBe(MESSAGE_FAIL_NOT_AUTHORIZED)
    }))
  })

  it("should be able to promote a player's mob", async () => {
    // when
    const check = await promote(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`), service)

    // then
    expect(check.status).toBe(CheckStatus.Ok)
    expect(check.result).toBe(playerToPromote.sessionMob)
  })

  it("should not promote if already immortal", async () => {
    // given
    playerToPromote.sessionMob.playerMob.authorizationLevel = AuthorizationLevel.Immortal

    // when
    const check = await promote(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`), service)

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS)
  })

  it("should not be able to promote banned mobs", async () => {
    playerToPromote.sessionMob.playerMob.standing = Standing.PermaBan

    // when
    const check = await promote(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`), service)

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_BANNED)
  })

  it("cannot promote non-player mobs", async () => {
    const MOB_NAME = "baz"
    const mob = getTestMob(MOB_NAME)
    service.mobTable.add(mob)

    const check = await promote(requestBuilder.create(RequestType.Promote, `promote ${mob.name}`), service)

    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_NOT_PLAYER)
  })
})
