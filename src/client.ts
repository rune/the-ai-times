import { REVIEW_TIMER_LENGTH } from "./logic"
import "./styles.css"

// Easy accessor for assets via name rather than static
// import. Makes it easier to manage assets
const ALL_ASSETS = import.meta.glob("./assets/**/*", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>

const ASSETS: Record<string, string> = {}

for (const key in ALL_ASSETS) {
  ASSETS[key.substring("./assets/".length)] = ALL_ASSETS[key]
}

let currentScreen = "captionScreen"

function div(id: string): HTMLDivElement {
  return document.getElementById(id) as HTMLDivElement
}

function img(id: string): HTMLImageElement {
  return document.getElementById(id) as HTMLImageElement
}

function textarea(id: string): HTMLTextAreaElement {
  return document.getElementById(id) as HTMLTextAreaElement
}

let image = 0

function showScreen(screen: string) {
  if (screen !== currentScreen) {
    div(currentScreen).classList.add("disabled")
    div(currentScreen).classList.remove("enabled")

    currentScreen = screen

    div(currentScreen).classList.remove("off")
    div(currentScreen).classList.remove("disabled")
    div(currentScreen).classList.add("enabled")
  }
}

let localPlayerId: string | undefined = undefined

setInterval(() => {
  if (currentScreen === "captionScreen") {
    if (localPlayerId) {
      Rune.actions.caption({
        name: Rune.getPlayerInfo(localPlayerId).displayName,
        text: textarea("playerInput").value,
      })
    }
  }
}, 250)

Rune.initClient({
  onChange: ({ game, yourPlayerId, event }) => {
    if (event && event.name === "stateSync") {
      if (event.isNewGame) {
        textarea("playerInput").disabled = false
        textarea("playerInput").value = ""
      }
    }
    localPlayerId = yourPlayerId

    if (image !== game.imageNumber) {
      image = game.imageNumber
      img("targetImage").src = ASSETS["images/" + image + ".png"]
      img("paperImage1").src = ASSETS["images/" + image + ".png"]
      img("paperImage2").src = ASSETS["images/" + image + ".png"]
      textarea("playerInput").focus()
    }

    const remaining = game.timerEndsAt - Rune.gameTime()
    const percent = (Math.max(0, remaining) / game.timerTotalTime) * 100 + "%"
    if (game.timerName === "caption") {
      showScreen("captionScreen")
      div("captionTimer").style.width = percent
      if (remaining < 0) {
        textarea("playerInput").disabled = true
      }
    }
    if (game.timerName === "review") {
      showScreen("reviewScreen")
      div("reviewTimer").style.width = percent

      const index = Math.floor(
        (game.playerOrder.length * REVIEW_TIMER_LENGTH - remaining) /
          REVIEW_TIMER_LENGTH
      )
      const playerId =
        game.playerOrder[Math.max(0, game.playerOrder.length - 1 - index)]
      div("headline").innerHTML = game.stories[playerId]?.headline ?? ""
      div("subtitle").innerHTML = game.stories[playerId]?.subtitle ?? ""
      div("story").innerHTML = game.stories[playerId]?.content ?? ""
      let date = new Date().toString()
      date = date.substring(0, 10).trim()
      div("date").innerHTML = date
    }
    if (game.timerName === "voting") {
      if (currentScreen !== "voteScreen") {
        div("articles").innerHTML = ""
        for (const key of game.playerOrder) {
          const story = game.stories[key]
          const button = document.createElement("div")
          button.classList.add("voteButton")
          button.addEventListener("click", () => {
            for (const selected of document.getElementsByClassName(
              "voteButtonSelected"
            )) {
              selected.classList.remove("voteButtonSelected")
            }
            button.classList.add("voteButtonSelected")
            Rune.actions.vote(key)
          })
          button.innerHTML = story.headline
          div("articles").appendChild(button)
        }
      }
      showScreen("voteScreen")
      div("voteTimer").style.width = percent
    }
    if (game.timerName === "results") {
      div("winnersEdition").style.display = "block"
      if (currentScreen !== "resultsScreen") {
        div("playerName").innerHTML =
          Rune.getPlayerInfo(game.winner)?.displayName ?? "Unknown"
        img("playerAvatar").src =
          Rune.getPlayerInfo(game.winner)?.avatarUrl ?? ""
      }
      div("resultHeadline").innerHTML =
        game.stories[game.winner]?.headline ?? ""
      div("resultSubtitle").innerHTML =
        game.stories[game.winner]?.subtitle ?? ""
      div("resultStory").innerHTML = game.stories[game.winner]?.content ?? ""
      let date = new Date().toString()
      date = date.substring(0, 10).trim()
      div("resultDate").innerHTML = date
      showScreen("resultScreen")
    }
  },
})
