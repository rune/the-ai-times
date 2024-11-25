import type { PlayerId, RuneClient } from "rune-sdk"

export interface GameState {
  captions: Record<PlayerId, string>
}

type GameActions = {
  caption: (text: string) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: () => {
    return {
      captions: {},
    }
  },
  updatesPerSecond: 10,
  update: () => {
    // update loop to run timer
  },
  actions: {
    caption: (text: string, { game, playerId }) => {
      game.captions[playerId] = text;
    }
  },
})
