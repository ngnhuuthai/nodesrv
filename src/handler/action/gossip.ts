import { Request } from "../../request/request"
import { gossip } from "../social"
import Response from "../../request/response"
import ResponseBuilder from "../../request/responseBuilder"

export default function(request: Request): Promise<Response> {
  gossip(request.player, request.player.sessionMob.name + " gossips, \"" + request.message + "\"")
  return new ResponseBuilder(request).info("You gossip, '" + request.message + "'")
}
