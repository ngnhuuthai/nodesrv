import Action from "../action/action"
import Skill from "../action/skill"
import Spell from "../action/spell"
import {Client} from "../client/client"
import GameService from "../gameService/gameService"
import ServiceBuilder from "../gameService/serviceBuilder"
import {newItem} from "../item/factory"
import {ItemType} from "../item/itemType"
import Container from "../item/model/container"
import {Inventory} from "../item/model/inventory"
import {Item} from "../item/model/item"
import {newMobLocation} from "../mob/factory"
import {Fight} from "../mob/fight/fight"
import {Mob} from "../mob/model/mob"
import Shop from "../mob/model/shop"
import {SpecializationType} from "../mob/specialization/specializationType"
import {AuthorizationLevel} from "../player/authorizationLevel"
import {Player} from "../player/model/player"
import newRegion from "../region/factory"
import {Terrain} from "../region/terrain"
import InputContext from "../request/context/inputContext"
import {Request} from "../request/request"
import RequestBuilder from "../request/requestBuilder"
import {RequestType} from "../request/requestType"
import {Direction} from "../room/constants"
import {newReciprocalExit, newRoom} from "../room/factory"
import {Exit} from "../room/model/exit"
import {Room} from "../room/model/room"
import Email from "../session/auth/login/email"
import Session from "../session/session"
import {SkillType} from "../skill/skillType"
import {SpellType} from "../spell/spellType"
import ItemBuilder from "./itemBuilder"
import {getTestMob} from "./mob"
import MobBuilder from "./mobBuilder"
import {getTestPlayer} from "./player"
import PlayerBuilder from "./playerBuilder"
import RoomBuilder from "./roomBuilder"

const ws = jest.fn(() => ({
  send: jest.fn(),
}))

export default class TestBuilder {
  public player: Player
  public room: Room
  private mobForRequest: Mob
  private serviceBuilder: ServiceBuilder = new ServiceBuilder()

  public async withClient() {
    if (!this.player) {
      await this.withPlayer()
    }
    if (!this.room) {
      this.withRoom()
    }
    const service = await this.getService()
    const client = new Client(
      new Session(new Email(jest.fn()())),
      ws(),
      "127.0.0.1",
      service.getActions(),
      service.mobService.locationService,
      service.eventService)
    await client.session.login(client, this.player)
    this.mobForRequest = client.getSessionMob()
    this.serviceBuilder.addMob(this.mobForRequest)

    return client
  }

  public withRoom(direction?: Direction) {
    const room = newRoom("a test room", "description of a test room")
    room.region = newRegion("a test region", Terrain.Plains)

    if (!this.room) {
      this.room = room
      if (this.player) {
        this.serviceBuilder.addMobLocation(newMobLocation(this.player.sessionMob, room))
      }
    } else {
      newReciprocalExit(this.room, room, direction).forEach(exit => this.addExit(exit))
    }

    this.serviceBuilder.addRoom(room)

    return new RoomBuilder(room, this.serviceBuilder)
  }

  public async withPlayerAndSkill(skillType: SkillType, level: number = 1): Promise<Player> {
    const playerBuilder = await this.withPlayer()
    playerBuilder.withSkill(skillType, level)

    return this.player
  }

  public async withPlayer(fn: (player: Player) => void = () => { /**/ }): Promise<PlayerBuilder> {
    const player = getTestPlayer()

    if (!this.player) {
      this.player = player
      this.mobForRequest = player.sessionMob
    }

    if (this.room) {
      this.serviceBuilder.addMobLocation(newMobLocation(player.sessionMob, this.room))
    }
    this.serviceBuilder.addMob(player.sessionMob)

    if (fn) {
      fn(player)
    }

    return new PlayerBuilder(player, this.serviceBuilder)
  }

  public async withAdminPlayer(
    authorizationLevel: AuthorizationLevel = AuthorizationLevel.Admin): Promise<PlayerBuilder> {
    const playerBuilder = await this.withPlayer()
    playerBuilder.player.sessionMob.playerMob.authorizationLevel = authorizationLevel

    return playerBuilder
  }

  public withMob(name?: string, specialization: SpecializationType = SpecializationType.Warrior): MobBuilder {
    const mob = getTestMob(name)
    mob.specialization = specialization
    if (!this.room) {
      this.withRoom()
    }
    this.serviceBuilder.addMobLocation(newMobLocation(mob, this.room))
    this.serviceBuilder.addMob(mob)

    if (!this.mobForRequest) {
      this.mobForRequest = mob
    }

    return new MobBuilder(mob, this.serviceBuilder)
  }

  public withTrainer(name?: string): MobBuilder {
    const mobBuilder = this.withMob(name)
    mobBuilder.mob.traits.trainer = true

    return mobBuilder
  }

  public withPracticeMob(): MobBuilder {
    const mobBuilder = this.withMob()
    mobBuilder.mob.traits.practice = true

    return mobBuilder
  }

  public withMerchant() {
    const mobBuilder = this.withMob(name)
    mobBuilder.mob.shop = new Shop()

    return mobBuilder
  }

  public withRandomItem(): ItemBuilder {
    const item = newItem(ItemType.Fixture, "a small wooden chair", "a small wooden chair is here.")
    this.serviceBuilder.addItem(item)
    return new ItemBuilder(item)
  }

  public withItem(itemType: ItemType, name: string, description: string): ItemBuilder {
    const item = newItem(itemType, name, description)
    if (itemType === ItemType.Corpse || itemType === ItemType.Container) {
      item.container = new Container()
      item.container.inventory = new Inventory()
    }
    this.serviceBuilder.addItem(item)
    if (!this.room) {
      this.withRoom()
    }
    this.room.inventory.addItem(item)

    return new ItemBuilder(item)
  }

  public withARandomCorpse(): ItemBuilder {
    return this
      .withItem(ItemType.Corpse, "a corpse of a mob", "a corpse of a mob is here")
  }

  public async fight(target = this.withMob().mob): Promise<Fight> {
    const service = await this.getService()
    const fight = new Fight(
      service.eventService,
      this.mobForRequest, target,
      this.room)
    service.mobService.addFight(fight)

    return fight
  }

  public createRequest(
    requestType: RequestType,
    input: string = requestType.toString(),
    targetMobInRoom?: Mob): Request {
    if (!this.mobForRequest) {
      this.withMob()
    }
    return new Request(
      this.mobForRequest,
      this.room,
      new InputContext(requestType, input),
      targetMobInRoom)
  }

  public async createRequestBuilder() {
    const service = await this.getService()
    return new RequestBuilder(service.getActions(), service.mobService.locationService, this.mobForRequest, this.room)
  }

  public async getActionDefinition(requestType: RequestType): Promise<Action> {
    return (await this.getService()).getAction(requestType)
  }

  public async getSkillDefinition(skillType: SkillType): Promise<Skill | undefined> {
    return (await this.getService()).getSkill(skillType)
  }

  public async getSpellDefinition(spellType: SpellType): Promise<Spell> {
    return (await this.getService()).getSpell(spellType)
  }

  public setTime(time: number) {
    this.serviceBuilder.setTime(time)

    return this
  }

  public async getService(): Promise<GameService> {
    return this.serviceBuilder.createService(this.room)
  }

  public addExit(exit: Exit) {
    this.serviceBuilder.addExit(exit)
  }
}
