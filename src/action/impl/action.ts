import {injectable} from "inversify"
import Check from "../../check/check"
import CheckedRequest from "../../check/checkedRequest"
import {CheckStatus} from "../../check/enum/checkStatus"
import {RequestType} from "../../messageExchange/enum/requestType"
import Request from "../../messageExchange/request"
import Response from "../../messageExchange/response"
import RequestService from "../../messageExchange/service/requestService"
import {ActionPart} from "../enum/actionPart"

@injectable()
export default abstract class Action {
  public isAbleToHandleRequestType(requestType: RequestType): boolean {
    const thisRequestType = this.getRequestType()
    return thisRequestType.startsWith(requestType) || requestType === RequestType.Any
  }

  public async handle(request: Request): Promise<Response> {
    if (!this.isAbleToHandleRequestType(request.getType())) {
      throw new Error("request type mismatch")
    }

    const checkResponse = await this.check(request)
    if (checkResponse.status === CheckStatus.Failed) {
      return request.respondWith().error(checkResponse.result)
    }

    return this.invoke(
      new RequestService(new CheckedRequest(request, checkResponse)))
  }

  public abstract check(request: Request): Promise<Check>
  public abstract invoke(requestService: RequestService): Promise<Response>
  public abstract getActionParts(): ActionPart[]
  public abstract getRequestType(): RequestType
  public abstract getHelpText(): string
}
