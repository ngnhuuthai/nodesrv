import { Client } from "../../client/client"
import AuthStep from "./authStep"
import Response from "./response"
import { ResponseStatus } from "./responseStatus"

export default class Request {
  public readonly client: Client
  public readonly input: string

  constructor(client: Client, input: string) {
    this.client = client
    this.input = input
  }

  public fail(authStep: AuthStep, message: string): Response {
    return new Response(
      this,
      ResponseStatus.FAILED,
      authStep,
      message,
    )
  }

  public ok(authStep: AuthStep, message: string = null): Response {
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