import type { PlayerId, RuneClient } from "rune-sdk"
import { IMAGE_DESCRIPTION, PROMPT } from "./prompt"
export const CAPTION_TIMER_LENGTH = 20000
export const REVIEW_TIMER_LENGTH = 20000
export const VOTE_TIMER_LENGTH = 20000
export const RESULT_TIMER_LENGTH = 150000

export interface Story {
  headline: string
  subtitle: string
  content: string
}

export interface GameState {
  captions: Record<PlayerId, string>
  stories: Record<PlayerId, Story>
  votes: Record<PlayerId, PlayerId>
  playerNames: Record<PlayerId, string>
  playerOrder: string[]
  winner: string
  imageNumber: number
  timerTotalTime: number
  timerEndsAt: number
  timerName: string
  prompting: boolean
}

type GameActions = {
  caption: (params: { name: string; text: string }) => void
  vote: (voteFor: string) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

function startTimer(game: GameState, name: string, length: number) {
  game.timerName = name
  game.timerTotalTime = length
  game.timerEndsAt = Rune.gameTime() + length
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: () => {
    const game = {
      captions: {},
      stories: {},
      votes: {},
      playerNames: {},
      playerOrder: [],
      imageNumber: 1 + Math.floor(Math.random() * 12),
      timerEndsAt: 0,
      timerTotalTime: 0,
      timerName: "",
      prompting: false,
      winner: "",
    }

    startTimer(game, "caption", CAPTION_TIMER_LENGTH)
    return game
  },
  ai: {
    promptResponse: ({ response }, { game, allPlayerIds }) => {
      const lines = response.split("\n")
      let story: Story = {
        headline: "",
        subtitle: "",
        content: "",
      }
      for (const line of lines) {
        if (line.startsWith("Winner:")) {
          const name = line.substring("Winner:".length).trim()
          for (const playerId of Object.keys(game.playerNames)) {
            if (
              name.toLowerCase() === game.playerNames[playerId].toLowerCase()
            ) {
              game.winner = playerId
            }
          }
        }
        if (line.startsWith("Article")) {
          let name = line.substring("Article ".length).trim()
          name = name.substring(0, name.length - 1)
          for (const playerId of Object.keys(game.playerNames)) {
            if (
              name.toLowerCase() === game.playerNames[playerId].toLowerCase()
            ) {
              story = {
                headline: "",
                subtitle: "",
                content: "",
              }
              game.stories[playerId] = story
              game.playerOrder.push(playerId)
            }
          }
        }
        if (line.startsWith("Title:")) {
          story.headline = line.substring("Title:".length).trim()
        }
        if (line.startsWith("Subtitle:")) {
          story.subtitle = line.substring("Subtitle:".length).trim()
        }
        if (line.startsWith("Story:")) {
          story.content = line.substring("Story:".length).trim()
        }
      }

      startTimer(game, "review", REVIEW_TIMER_LENGTH * allPlayerIds.length)
    },
  },
  updatesPerSecond: 10,
  update: ({ game, allPlayerIds }) => {
    // update loop to run timer
    if (Rune.gameTime() > game.timerEndsAt && game.timerEndsAt !== 0) {
      if (game.timerName === "caption") {
        game.timerEndsAt = 0
        let input =
          "Image Description: " + IMAGE_DESCRIPTION[game.imageNumber] + "\n"
        for (const id of allPlayerIds) {
          input +=
            "Caption " +
            game.playerNames[id] +
            ":" +
            (game.captions[id] ?? "Who knows whats going on here?") +
            "\n"
        }
        Rune.ai.promptRequest({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: PROMPT,
                },
                {
                  type: "text",
                  text: input,
                },
              ],
            },
          ],
        })
      } else if (game.timerName === "review") {
        startTimer(game, "voting", VOTE_TIMER_LENGTH)
      } else if (game.timerName === "voting") {
        // do scoring
        const scores: Record<string, number> = {}
        for (const id of game.playerOrder) {
          if (game.votes[id]) {
            scores[game.votes[id]] = (scores[game.votes[id]] ?? 0) + 1
          }
        }
        let max = 0
        let best = ""
        let draw = true
        for (const id of Object.keys(scores)) {
          if (scores[id] === max) {
            draw = true
          }
          if (scores[id] > max) {
            max = scores[id]
            best = id
            draw = false
          }
        }

        if (best && max > 0 && !draw) {
          game.winner = best
        }

        startTimer(game, "results", RESULT_TIMER_LENGTH)
      }
    }
  },
  actions: {
    vote: (voteFor, { game, playerId }) => {
      game.votes[playerId] = voteFor
    },
    caption: ({ name, text }, { game, playerId }) => {
      if (text.trim().length === 0) {
        text = "Who knows whats going on here?"
      }
      text = text.replaceAll("\n", "")
      game.playerNames[playerId] = name
      game.captions[playerId] = text
    },
  },
})
