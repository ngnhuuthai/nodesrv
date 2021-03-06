import * as assert from "assert"
import {Timings} from "../src/app/constants"
import {Environment} from "../src/app/enum/environment"
import createAppContainer from "../src/app/factory/factory"
import {tick} from "../src/server/constants"
import {ObserverChain} from "../src/server/observers/observerChain"
import {initializeConnection} from "../src/support/db/connection"
import {DiceRoller} from "../src/support/random/dice"
import {FiveMinuteTimer} from "../src/support/timer/fiveMinuteTimer"
import {MinuteTimer} from "../src/support/timer/minuteTimer"
import {RandomTickTimer} from "../src/support/timer/randomTickTimer"
import {SecondIntervalTimer} from "../src/support/timer/secondTimer"
import {ShortIntervalTimer} from "../src/support/timer/shortIntervalTimer"

/**
 * Obtain the start room ID and port from arguments passed in
 */
const startRoomID = +process.argv[2]
const port = +process.argv[3]
console.time(Timings.init)
assert.ok(startRoomID, "start room ID has required to be defined")
console.log(`startup parameters:  port: ${port}, room: ${startRoomID}`)

initializeConnection().then(async () => {
  const app = await createAppContainer(
    process.env.STRIPE_API_KEY as string,
    process.env.STRIPE_PLAN_ID as string,
    process.env.ENV as Environment,
    startRoomID,
    port)

  /**
   * seed mob and item resets
   */
  console.time(Timings.resetService)
  const resetService = app.getResetService()
  console.timeEnd(Timings.resetService)
  console.time(Timings.seedMobs)
  await resetService.seedMobTable()
  console.timeEnd(Timings.seedMobs)
  console.time(Timings.seedItems)
  await resetService.seedItemRoomResets()
  console.timeEnd(Timings.seedItems)

  /**
   * server observers
   */
  const server = app.getGameServer()
  const observers = app.getObservers()
  server.addObserver(new ObserverChain([
    observers.getTickObserver(),
    observers.getDecrementAffectsObserver(),
    observers.getWanderObserver(),
  ]), new RandomTickTimer(
    new DiceRoller(tick.dice.sides, tick.dice.rolls, tick.dice.modifier)))
  server.addObserver(observers.getRegionWeatherObserver(), new MinuteTimer())
  server.addObserver(observers.getFightRoundsObserver(), new SecondIntervalTimer())
  server.addObserver(observers.getRespawnerObserver(), new FiveMinuteTimer())
  server.addObserver(observers.getDecrementPlayerDelayObserver(), new SecondIntervalTimer())
  server.addObserver(observers.getHandleClientRequestsObserver(), new ShortIntervalTimer())

  /**
   * start the game
   */
  await server.start()
  console.timeEnd(Timings.init)
})
