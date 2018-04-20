import { getConnection } from "../db/connection"
import { Direction } from "../room/constants"
import { newRoom } from "../room/factory"
import { newArena, newInn, newTrail, newWorld } from "./factory"

describe("area factory", () => {
  it("should be able to connect two built structures", () => {
    const root = newRoom("test", "test")
    expect.assertions(25)

    return getConnection().then(() => newInn(root).then((innRooms) =>
      newTrail(innRooms[innRooms.length - 1], Direction.South, 3)
      .then((trailRooms) => {
        const allRooms = [...innRooms, ...trailRooms]
        expect(allRooms.length).toBe(8)
        allRooms.forEach((room) => {
          expect(room.exits.length).toBeLessThanOrEqual(6)
          expect(room.exits.length).toBeGreaterThan(0)
          const directions = []
          room.exits.forEach((e) => directions.push(e.direction))
          expect([...new Set(directions)].length).toBe(directions.length)
        })
      })))
  })

  it("should be able to create an arena (a matrix of rooms)", () => {
    return newArena(newRoom("name", "description"), 3, 3)
      .then((rooms) => {
        expect(rooms.length).toBe(9)
      })
  })

  it("a new world should return a lot of rooms", () => {
    const rootRoom = newRoom("test", "test")

    return Promise.all([
      newWorld(rootRoom),
      newInn(rootRoom),
      newTrail(rootRoom, Direction.West, 1),
      newArena(rootRoom, 1, 1),
    ]).then(([world, inn, trail, arena]) => {
      expect(world.length).toBeGreaterThanOrEqual(inn.length + trail.length + arena.length)
    })
  })
})
