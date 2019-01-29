import { CheckStatus } from "../../../check/checkStatus"
import {Messages} from "../../../check/constants"
import GameService from "../../../gameService/gameService"
import { Standing } from "../../../mob/enum/standing"
import { AuthorizationLevel } from "../../../player/authorizationLevel"
import { allAuthorizationLevels } from "../../../player/constants"
import { Player } from "../../../player/model/player"
import RequestBuilder from "../../../request/requestBuilder"
import { RequestType } from "../../../request/requestType"
import { getTestMob } from "../../../test/mob"
import TestBuilder from "../../../test/testBuilder"
import Action from "../../action"
import {
  MESSAGE_FAIL_BANNED,
  MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS,
} from "../../constants"

const MOB_TO_PROMOTE = "bob"
const MOB_SELF = "alice"
let requestBuilder: RequestBuilder
let service: GameService
let player: Player
let playerToPromote: Player

describe("promote moderation preconditions", () => {

  let action: Action

  beforeEach(async () => {
    const testBuilder = new TestBuilder()
    const adminPlayerBuilder = await testBuilder.withAdminPlayer(AuthorizationLevel.Immortal)
    player = adminPlayerBuilder.player
    player.sessionMob.name = MOB_SELF
    const playerBuilder = await testBuilder.withPlayer()
    playerToPromote = playerBuilder.player
    playerToPromote.sessionMob.name = MOB_TO_PROMOTE
    requestBuilder = await testBuilder.createRequestBuilder()
    service = await testBuilder.getService()
    action = await testBuilder.getActionDefinition(RequestType.Promote)
  })

  it("should not be able to promote if not an immortal", async () => {
    return await Promise.all(
      allAuthorizationLevels.filter((auth) => auth !== AuthorizationLevel.Immortal)
        .map(async (authorizationLevel) => {
      player.sessionMob.playerMob.authorizationLevel = authorizationLevel
      const check = await action.check(
        requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`))
      expect(check.status).toBe(CheckStatus.Failed)
      expect(check.result).toBe(Messages.NotAuthorized)
    }))
  })

  it("should be able to promote a player's mob", async () => {
    // when
    const check = await action.check(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`))

    // then
    expect(check.status).toBe(CheckStatus.Ok)
    expect(check.result).toBe(playerToPromote.sessionMob)
  })

  it("should not promote if already immortal", async () => {
    // given
    playerToPromote.sessionMob.playerMob.authorizationLevel = AuthorizationLevel.Immortal

    // when
    const check = await action.check(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS)
  })

  it("should not be able to promote banned mobs", async () => {
    playerToPromote.sessionMob.playerMob.standing = Standing.PermaBan

    // when
    const check = await action.check(
      requestBuilder.create(RequestType.Promote, `promote ${playerToPromote.sessionMob.name}`))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_BANNED)
  })

  it("cannot promote non-player mobs", async () => {
    const MOB_NAME = "baz"
    const mob = getTestMob(MOB_NAME)
    service.mobService.mobTable.add(mob)

    const check = await action.check(requestBuilder.create(RequestType.Promote, `promote ${mob.name}`))

    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(Messages.NotAPlayer)
  })
})