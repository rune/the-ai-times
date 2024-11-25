import shareBackgroundUrl from "./assets/sharebackground.png"
import winnersUrl from "./assets/winners.png"
import runeLogoUrl from "./assets/runelogo.png"
import { img } from "./client"
import { Story } from "./logic"

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image()
    image.src = src
    image.crossOrigin = "anonymous"
    image.addEventListener("load", () => {
      resolve(image)
    })
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
  maxWidth: number = width
) {
  const words = text.split(" ")
  let line = ""
  for (const word of words) {
    const newLine = line.length === 0 ? word : line + " " + word
    if (ctx.measureText(newLine).width > width) {
      ctx.fillText(line, x, y, maxWidth)
      y += lineHeight
      line = word
    } else {
      line = newLine
    }
  }
  ctx.fillText(line, x, y, maxWidth)
}

export async function shareStory(authorId: string, story: Story) {
  const backgroundImage = await loadImage(shareBackgroundUrl)
  const winnerImage = await loadImage(winnersUrl)
  const runeLogo = await loadImage(runeLogoUrl)
  const playerInfo = Rune.getPlayerInfo(authorId)
  const playerAvatar = await loadImage(playerInfo.avatarUrl)

  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext("2d")

  if (ctx) {
    ctx.drawImage(backgroundImage, 0, 0)
    ctx.drawImage(winnerImage, 50, 180, 980, 70)
    ctx.textAlign = "center"
    ctx.font = "40px Baker-regular"
    ctx.fillStyle = "black"
    ctx.fillText("WINNERS EDITION", 1080 / 2, 230)

    ctx.save()
    ctx.filter = "grayscale(100%)"
    ctx.drawImage(img("targetImage"), 600, 580, 400, 400)
    ctx.restore()

    ctx.save()
    ctx.translate(0, 280)

    ctx.font = "150px Chomsky"
    ctx.fillStyle = "black"
    ctx.fillText("A.I.", 1080 / 2 - 10, 100)
    ctx.font = "90px Chomsky"
    ctx.fillText("  The             Times", 1080 / 2, 90)
    ctx.fillRect(280, 20, 110, 5)
    ctx.fillRect(660, 20, 200, 5)
    ctx.fillRect(280, 100, 110, 5)
    ctx.fillRect(660, 100, 200, 5)
    ctx.restore()

    ctx.font = "80px Basker-regular"
    ctx.fillStyle = "black"
    ctx.fillText(story.headline.toUpperCase(), 1080 / 2 - 10, 510, 900)
    ctx.fillRect(100, 530, 900, 5)
    ctx.fillRect(100, 540, 900, 5)
    ctx.fillRect(100, 420, 900, 5)
    ctx.fillRect(100, 430, 900, 5)

    let date = new Date().toString()
    date = date.substring(0, 10).trim()
    ctx.font = "60px Basker-regular"
    ctx.fillStyle = "#666"
    ctx.textAlign = "left"
    ctx.fillText(date, 100, 630)
    ctx.font = "30px Basker-rgeular"
    ctx.fillText("WRITTEN BY", 100, 1610)
    ctx.drawImage(playerAvatar, 100, 1620, 60, 60)
    ctx.font = "50px Basker-regular"
    ctx.fillStyle = "black"
    ctx.fillText(playerInfo.displayName, 180, 1670)

    ctx.font = "60px Basker-regular"
    ctx.fillStyle = "black"
    ctx.textAlign = "left"
    wrapText(ctx, story.subtitle, 100, 730, 450, 60)

    ctx.font = "50px Basker-regular"
    ctx.fillStyle = "black"
    wrapText(ctx, story.content, 100, 1100, 1200, 60, 900)

    ctx.fillStyle = "#666"
    ctx.fillRect(100, 1025, 900, 5)
    ctx.fillRect(100, 1550, 900, 5)

    ctx.drawImage(runeLogo, (1080 - runeLogo.width) / 2, 1850 - runeLogo.height)
    ctx.font = "100px Chomsky"
    ctx.textAlign = "center"
    ctx.save()
    ctx.translate(4, 4)
    ctx.fillStyle = "rgba(0,0,0,0.7)"
    ctx.fillText("A.I.", 1080 / 2 - 10, 100)
    ctx.font = "60px Chomsky"
    ctx.fillText("  The              Times", 1080 / 2, 90)
    ctx.fillRect(350, 40, 100, 5)
    ctx.fillRect(620, 40, 130, 5)
    ctx.fillRect(350, 100, 100, 5)
    ctx.fillRect(620, 100, 130, 5)
    ctx.restore()
    ctx.fillStyle = "white"
    ctx.font = "100px Chomsky"
    ctx.fillText("A.I.", 1080 / 2 - 10, 100)
    ctx.font = "60px Chomsky"
    ctx.fillText("  The              Times", 1080 / 2, 90)
    ctx.fillRect(350, 40, 100, 5)
    ctx.fillRect(620, 40, 130, 5)
    ctx.fillRect(350, 100, 100, 5)
    ctx.fillRect(620, 100, 130, 5)
    ctx.translate(150, 550)
   
    Rune.showShareImage(canvas.toDataURL("image/png", 1))
  }
}
