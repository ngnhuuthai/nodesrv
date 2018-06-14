import { Client } from "../client/client"
import look from "../handler/action/look"
import { RequestType } from "../request/requestType"
import { Mob } from "../mob/model/mob"
import { Player } from "../player/model/player"
import { createRequestArgs, Request as ActionRequest } from "../request/request"
import AuthStep from "./auth/authStep"
import Complete from "./auth/complete"
import Email from "./auth/login/email"
import Request from "./auth/request"
import { SessionStatus } from "./status"

export default class Session {
  public readonly client: Client
  private player: Player
  private mob: Mob
  private status: SessionStatus = SessionStatus.Initialized
  private authStep: AuthStep = new Email()

  constructor(client: Client) {
    this.client = client
  }

  public isLoggedIn(): boolean {
    return this.status === SessionStatus.LoggedIn
  }

  public async handleRequest(request: Request) {
    const response = await this.authStep.processRequest(request)
    this.authStep = response.authStep
    if (response.message) {
      this.client.send({ message: response.message })
    }
    if (this.authStep instanceof Complete) {
      await this.login(this.authStep.player)
      return
    }
    this.client.send({ message: this.authStep.getStepMessage() })
  }

  public getAuthStepMessage(): string {
    return this.authStep.getStepMessage()
  }

  public getMob() {
    return this.mob
  }

  public getPlayer() {
    return this.player
  }

  public async login(player: Player) {
    this.mob = player.sessionMob
    this.player = player
    this.client.startRoom.addMob(this.mob)
    this.client.player = this.player
    this.status = SessionStatus.LoggedIn
    this.client.send({ player: this.player })
    this.client.send(await look(new ActionRequest(this.player, RequestType.Look, createRequestArgs("look"))))
  }
}
