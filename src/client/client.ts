// @ts-ignore
import * as stringify from "json-stringify-safe"
import Action from "../action/impl/action"
import CheckedRequest from "../check/checkedRequest"
import Cost from "../check/cost/cost"
import {EventType} from "../event/enum/eventType"
import {createClientEvent, createCostEvent, createInputEvent, createMobEvent} from "../event/factory/eventFactory"
import EventService from "../event/service/eventService"
import { MobEntity } from "../mob/entity/mobEntity"
import CostEvent from "../mob/event/costEvent"
import LocationService from "../mob/service/locationService"
import { PlayerEntity } from "../player/entity/playerEntity"
import RequestBuilder from "../request/builder/requestBuilder"
import Request from "../request/request"
import Response from "../request/response"
import { RoomEntity } from "../room/entity/roomEntity"
import { default as AuthRequest } from "../session/auth/request"
import Session from "../session/session"
import InputEvent from "./event/inputEvent"

export class Client {
  public player: PlayerEntity
  private requests: any = []

  constructor(
    public readonly session: Session,
    public readonly ws: WebSocket,
    public readonly ip: string,
    private readonly actions: Action[],
    private readonly locationService: LocationService,
    private readonly eventService: EventService) {
    this.ws.onmessage = this.onMessage.bind(this)
  }

  public hasRequests(): boolean {
    return this.requests.length > 0
  }

  public addRequest(request: Request | AuthRequest): void {
    this.requests.push(request)
  }

  public isLoggedIn(): boolean {
    return this.session.isLoggedIn()
  }

  public canHandleRequests(): boolean {
    if (!this.isLoggedIn()) {
      return this.hasRequests()
    }

    return this.hasRequests() && this.player.delay === 0
  }

  public getSessionMob(): MobEntity {
    return this.session.getMob()
  }

  public async handleNextRequest() {
    if (!this.session.isLoggedIn()) {
      const request = this.requests.shift() as AuthRequest
      const response = await this.session.handleRequest(this, request)
      if (this.session.isLoggedIn()) {
        console.log("handleNextRequest and user is logged in now")
        await this.eventService.publish(createMobEvent(EventType.MobCreated, this.session.getMob()))
        await this.eventService.publish(createClientEvent(EventType.ClientLogin, this))
      }
      return response
    }
    return this.handleRequest(this.requests.shift())
  }

  public async handleRequest(request: Request): Promise<Response> {
    const matchingHandlerDefinition = this.actions.find(action =>
      action.isAbleToHandleRequestType(request.getType())) as Action
    const eventResponse = await this.eventService.publish(
      createInputEvent(
        request,
        matchingHandlerDefinition))
    if (eventResponse.isSatisfied()) {
      const inputEvent = eventResponse.event as InputEvent
      const res = inputEvent.response as Response
      this.send(res.getPayload())
      this.sendMessage(this.player.prompt())
      return res
    }
    const response = await matchingHandlerDefinition.handle(request)
    if (response.request instanceof CheckedRequest) {
      await this.applyCosts(response.request.check.costs)
    }
    this.send(response.getPayload())
    this.sendMessage(this.player.prompt())
    return response
  }

  public send(data: any): void {
    this.ws.send(stringify(data))
  }

  public sendMessage(message: string) {
    this.send({ message })
  }

  public tick(id: string, timestamp: Date) {
    this.send({ tick: { id, timestamp }})
  }

  private onMessage(message: any) {
    try {
      const mobLocation = this.locationService.getLocationForMob(this.getSessionMob())
      this.addRequest(this.getNewRequestFromMessageEvent(message, mobLocation.room))
      return
    } catch (e) {
      // fine
    }
    this.addRequest(this.getNewRequestFromMessageEvent(message))
  }

  private getNewRequestFromMessageEvent(messageEvent: MessageEvent, room?: RoomEntity): Request | AuthRequest {
    const data = JSON.parse(messageEvent.data)
    if (!this.player) {
      return new AuthRequest(this, data.request)
    }
    const requestArgs = data.request.split(" ")
    const mob = this.player.sessionMob
    return new RequestBuilder(this.actions, this.locationService, mob, room).create(requestArgs[0], data.request)
  }

  private async applyCosts(costs: Cost[]): Promise<void> {
    const eventResponse = await this.eventService.publish(createCostEvent(this.player.sessionMob, costs))
    if (eventResponse.isModified()) {
      costs = (eventResponse.event as CostEvent).costs
    }
    costs.forEach(cost => cost.applyTo(this.player))
  }
}
