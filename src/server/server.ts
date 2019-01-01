import {Client} from "../client/client"
import ClientEvent from "../client/event/clientEvent"
import EventService from "../event/eventService"
import {EventType} from "../event/eventType"
import {Room} from "../room/model/room"
import {poll} from "../support/poll/poll"
import {ImmediateTimer} from "../timer/immediateTimer"
import {Timer} from "../timer/timer"
import ClientService from "./clientService"
import {events} from "./constants"
import {Observer} from "./observers/observer"

enum Status {
  Initialized,
  Started,
  Terminated,
}

export class GameServer {
  private status: Status = Status.Initialized

  constructor(
    public readonly wss,
    public readonly startRoom: Room,
    public readonly clientService: ClientService,
    public readonly eventService: EventService) {}

  public async start(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error("Status must be initialized to start")
    }
    this.status = Status.Started
    this.wss.on(events.connection, this.addWS.bind(this))
  }

  public terminate(): void {
    this.status = Status.Terminated
    this.wss.close()
  }

  public async addWS(ws: WebSocket, req): Promise<void> {
    const client = this.clientService.createNewClient(ws, req)
    console.info("new client connected", { ip: client.ip })
    ws.onclose = () => this.removeClient(client)
    client.send({ message: client.session.getAuthStepMessage() })
  }

  public isInitialized(): boolean {
    return this.status === Status.Initialized
  }

  public isStarted(): boolean {
    return this.status === Status.Started
  }

  public isTerminated(): boolean {
    return this.status === Status.Terminated
  }

  public addObserver(observer: Observer, timer: Timer): void {
    poll(() => observer.notify(this.clientService.getClients()), timer)
    if (timer instanceof ImmediateTimer) {
      observer.notify(this.clientService.getClients())
    }
  }

  public getClientCount(): number {
    return this.clientService.getClientCount()
  }

  private async removeClient(client: Client) {
    await this.eventService.publish(new ClientEvent(EventType.ClientDisconnected, client))
  }
}
