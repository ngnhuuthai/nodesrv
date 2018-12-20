import CheckedRequest from "../../check/checkedRequest"
import { CheckType } from "../../check/checkType"
import Response from "../../request/response"
import {Exit} from "../../room/model/exit"
import { Messages } from "./constants"

export default function(checkedRequest: CheckedRequest): Promise<Response> {
  const exit = checkedRequest.getCheckTypeResult(CheckType.HasTarget) as Exit
  exit.door.isClosed = false

  return checkedRequest.respondWith().success(
    Messages.Open.Success, {
      direction: exit.direction,
      door: exit.door.name,
      openVerb: "open",
    }, {
      direction: exit.direction,
      door: exit.door.name,
      openVerb: "opens",
    })
}