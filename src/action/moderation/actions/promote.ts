import Maybe from "../../../functional/maybe"
import { Mob } from "../../../mob/model/mob"
import { AuthorizationLevel, getAuthorizationLevelName } from "../../../player/authorizationLevel"
import Response from "../../../request/response"
import ResponseBuilder from "../../../request/responseBuilder"
import CheckedRequest from "../../check/checkedRequest"
import { MESSAGE_FAIL_NO_MORE_PROMOTIONS } from "./constants"

export function getNextPromotion(mob: Mob) {
  switch (mob.getAuthorizationLevel()) {
    case AuthorizationLevel.None:
      return AuthorizationLevel.Mortal
    case AuthorizationLevel.Mortal:
      return AuthorizationLevel.Admin
    case AuthorizationLevel.Admin:
      return AuthorizationLevel.Judge
    case AuthorizationLevel.Judge:
      return AuthorizationLevel.Immortal
    default:
      return undefined
  }
}

export default function(checkedRequest: CheckedRequest): Promise<Response> {
  const target = checkedRequest.check.result
  const newAuthorizationLevel = getNextPromotion(target)
  const responseBuilder = new ResponseBuilder(checkedRequest.request)

  return new Maybe(newAuthorizationLevel)
    .do(() => {
      target.playerMob.authorizationLevel = newAuthorizationLevel
      return responseBuilder.success(
        `You promoted ${target.name} to ${getAuthorizationLevelName(newAuthorizationLevel)}.`)
    })
    .or(() => responseBuilder.fail(MESSAGE_FAIL_NO_MORE_PROMOTIONS))
    .get()
}