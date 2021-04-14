import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"
import { ITurnip } from "../stores/TurnipPriceStore"

type priceList = (number | '')[]

const getEmptyPriceList = () => { return Array(14).fill('') }

const constructWeekPrices = (turnips: ITurnip[]) => {
  const buy_price = turnips.filter(t => t.day.includes('Sun'))[0]?.price
  const sell_prices: priceList = getEmptyPriceList()
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
  pattern0?: number
  pattern1?: number
  pattern2?: number
  pattern3?: number
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
      chance = constructPatternProbability(20, 50, 65)
      break;
    case 1:
      chance = constructPatternProbability(50, 55, 75)
      break;
    case 2:
      chance = constructPatternProbability(25, 70, 75)
      break;
    case 3:
      chance = constructPatternProbability(45, 70, 55)
      break;
    }
  }
  return chance
}

const basePrice = [ 90, 110 ]

const recognizePattern1 = (prices: priceList) => {
  const possibleMinValues = getEmptyPriceList()
  const possibleMaxValues = getEmptyPriceList()
  let [ rateMin, rateMax ] = [ .85, .9 ]
  const [ rateMinDecrease, rateMaxDecrease ] = [ 0.03, .05 ]

  possibleMinValues[0] = prices[0] || 90
  possibleMaxValues[0] = prices[0] || 110
  // PATTERN 1: decreasing middle, high spike, random low
  // peak starts earliest at stage 3
  possibleMinValues[2] = possibleMinValues[0] * rateMin; rateMin -= rateMaxDecrease
  possibleMaxValues[2] = possibleMaxValues[0] * rateMax; rateMax -= rateMinDecrease
}

const pattern2PossiblePrices = (prices: priceList) => {

}

const predictNextWeek = (previousWeekPrices: priceList) => {

}

const predictPattern = (prices: priceList) => {
  const predictions: IPattern = { }
}

export const TurnipWeekPredicter = observer((props) => {
  const { turnipPriceStore: tps } = useStores();
  const [ weekNumber, setWeekNumber ] = React.useState(props !== undefined ? props.weekNumber : undefined)
  // const { week, weekNumber } = props

  if (weekNumber !== undefined) {
    const weekTurnips = tps.getWeekTurnips(weekNumber)
    const prices = constructWeekPrices(weekTurnips)
    console.log(weekNumber, '\n', JSON.stringify(prices))
    return (
      <div className={'week-prediction'}>
        {/* <span>Number of prices: {weekTurnips.length}</span> */}
        {/* <span>Prices: {JSON.stringify(prices)}</span> */}
        <div className={"pattern-predictions-container"}>
          <div className={"pattern-prediction"}><h5>P0</h5></div>
          <div className={"pattern-prediction"}><h5>P1</h5></div>
          <div className={"pattern-prediction"}><h5>P2</h5></div>
          <div className={"pattern-prediction"}><h5>P3</h5></div>
        </div>
      </div>
    )
  }
  return null
})