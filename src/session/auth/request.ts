import { Client } from "../../client/client"
import InputContext from "../../request/context/inputContext"
import {RequestType} from "../../request/enum/requestType"
import AuthStep from "./authStep"
import { ResponseStatus } from "./enum/responseStatus"
import Response from "./response"

export default class Request {
  constructor(
    public readonly client: Client,
    public readonly input: string) {}

  public getContextAsInput(): InputContext {
    return new InputContext(RequestType.Noop, this.input)
  }

  public fail(authStep: AuthStep, message: string): Response {
    return new Response(
      this,
      ResponseStatus.FAILED,
      authStep,
      message,
    )
  }

  public ok(authStep: AuthStep, message?: string): Response {
    return new Response(
      this,
      ResponseStatus.OK,
      authStep,
      message,
    )
  }

  public didConfirm() {
    return this.input === "y"
  }

  public didDeny() {
    return this.input === "n"
  }
}
