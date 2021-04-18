import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"
import { ITurnip } from "../stores/TurnipPriceStore"

export type TPrice = (number | '')[]

const getEmptyPriceList = () => { return Array(14).fill('') }

const constructWeekPrices = (turnips: ITurnip[]) => {
  const buy_price = turnips.filter(t => t.day.includes('Sun'))[0]?.price
  const sell_prices: TPrice = getEmptyPriceList()
  // buy price will never be zero bells
  if (buy_price) {
    sell_prices[0] = buy_price
  }

  turnips.forEach(t => {
    const day = new Date(t.day).getDay()
    sell_prices[day * 2 + (t.time === 'morning' ? 0 : 1)] = t.price
  })
  return sell_prices
}

interface IPattern {
  pattern0?: number // PATTERN 0: high, decreasing, high, decreasing, high
  pattern1?: number // PATTERN 1: decreasing middle, high spike, random low
  pattern2?: number // PATTERN 2: consistently decreasing
  pattern3?: number // PATTERN 3: decreasing, spike, decreasing
}

const constructPatternProbability = (p0: number, p1: number, p2: number): IPattern => {
  const tot = 100
  return {
    pattern0: p0 / tot,
    pattern1: (p1 - p0) / tot,
    pattern2: (p2 - p1) / tot,
    pattern3: (tot - p2) / tot,
  }
}

const nextPatternProbabilities = (pattern: number) => {
  let chance: IPattern
  if (pattern >= 4) {
    chance = { pattern2: 1 }
  }
  else {
    switch (pattern) {
      case 0:
        chance = constructPatternProbability(20, 50, 65) // 20, 30, 15, 35
        break;
      case 1:
        chance = constructPatternProbability(50, 55, 75) // 50,  5, 20, 25
        break;
      case 3:
        chance = constructPatternProbability(45, 70, 85) // 45, 25, 15, 15
        break;
      default: // pattern 2
        chance = constructPatternProbability(25, 70, 75) // 25, 45,  5, 25
        break;
    }
  }
  return chance
}

import PATTERNS from "./turnipWeekPatterns"
import { IPatternMultiplier, IPatternMultipliers } from "./turnipWeekPatternCalculator"

function transpose(a) {
  return a.map((_, colIndex) => a.map(row => row[colIndex])).filter(c => !c.every(e => e === undefined));
}

const filterPossible = (prices: TPrice, patterns: IPatternMultiplier) => {
  const basePrice = prices[0]
  if (basePrice !== '') {
    let { mins, maxs } = patterns
    const possible = { mins: [], maxs: [] }

    for (let i = 0; i < mins.length; i++) {
      const possibilities = []
      for (let j = 0; j < prices.length; j++) {
        if (j < 2) {
          possibilities.push(true)
        } else {
          if (prices[j] && mins[i][j] && mins[i][j] > 0 && maxs[i][j] > 0) {
            if (mins[i][j] <= prices[j] / basePrice && maxs[i][j] >= prices[j] / basePrice) {
              possibilities.push(true)
            } else {
              possibilities.push(false)
            }
          }
        }
      }
      if (possibilities.every(p => p)) {
        possible.mins.push(mins[i])
        possible.maxs.push(maxs[i])
      }
    }
    // console.log("Found possible patterns", possible)
    return possible
  }
}

const comparePricesToPatterns = (prices: TPrice) => {
  const possiblePatterns: IPatternMultipliers = {
    pattern0: filterPossible(prices, PATTERNS.pattern0),
    pattern1: filterPossible(prices, PATTERNS.pattern1),
    pattern2: filterPossible(prices, PATTERNS.pattern2),
    pattern3: filterPossible(prices, PATTERNS.pattern3),
  }

  console.log("Pattern 0", possiblePatterns.pattern0)
  console.log("Pattern 1", possiblePatterns.pattern1)
  console.log("Pattern 2", possiblePatterns.pattern2)
  console.log("Pattern 3", possiblePatterns.pattern3)
  return possiblePatterns
}

export const TurnipWeekPredicter = observer((props) => {
  const { turnipPriceStore: tps } = useStores();
  const [weekNumber, setWeekNumber] = React.useState(props !== undefined ? props.weekNumber : undefined)
  // const { week, weekNumber } = props

  if (weekNumber !== undefined) {
    const weekTurnips = tps.getWeekTurnips(weekNumber)
    if (weekTurnips.length === 0) {
      return <div></div>
    }
    // console.log(patterns)
    const prices = constructWeekPrices(weekTurnips)
    const possiblePatterns = comparePricesToPatterns(prices)
    const numPossiblePatterns = Object.values(possiblePatterns).reduce((key, value) => + (value.mins.length > 0), 0)
    console.log(numPossiblePatterns)
    console.log(weekNumber, '\n', JSON.stringify(prices))
    return (
      <div className={'week-prediction'}>
        <div className={"pattern-predictions-container"}>
          {possiblePatterns.pattern0.mins.length
            ? <div className={"pattern-prediction"}><h5>P0</h5><p>Probability: {possiblePatterns.pattern0.mins.length ? '❓' : '❌'}</p></div>
            : null
          }
          {possiblePatterns.pattern1.mins.length
            ? <div className={"pattern-prediction"}><h5>P1</h5><p>Probability: {possiblePatterns.pattern0.mins.length ? '❓' : '❌'}</p></div>
            : null
          }
          {possiblePatterns.pattern2.mins.length
            ? <div className={"pattern-prediction"}><h5>P2</h5><p>Probability: {possiblePatterns.pattern0.mins.length ? '❓' : '❌'}</p></div>
            : null
          }
          {possiblePatterns.pattern3.mins.length
            ? <div className={"pattern-prediction"}><h5>P3</h5><p>Probability: {possiblePatterns.pattern0.mins.length ? '❓' : '❌'}</p></div>
            : null
          }

        </div>
      </div>
    )
  }
  return null
})