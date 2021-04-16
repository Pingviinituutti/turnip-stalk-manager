import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"
import { ITurnip } from "../stores/TurnipPriceStore"
import patterns from "./turnipWeekPatterns"

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

const recognizePattern0 = (prices: priceList) => { 
  // PATTERN 0: high, decreasing, high, decreasing, high
  const baseMinPrice = prices[0] || 90
  const baseMaxPrice = prices[0] || 110

  let work = 0

  let validPeaks = []
  for (let decPhaseLen1 = 2; decPhaseLen1 <= 3; decPhaseLen1++) {
    const decPhaseLen2 = 5 - decPhaseLen1
    
    for (let highPhaseLen1 = 0; highPhaseLen1 <= 6; highPhaseLen1++) {
      let highPhaseLen2and3 = 7 - highPhaseLen1
      
      peakLoop:
      for (let highPhaseLen3 = 0; highPhaseLen3 <= highPhaseLen2and3 - 1; highPhaseLen3++) {
        const possibleMinValues = getEmptyPriceList()
        const possibleMaxValues = getEmptyPriceList()

        work = 2

        // high phase 1
        for (let i = 0; i < highPhaseLen1; i++, work++) {
          possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
          possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)

          if (prices[work] !== '') {
            // Check if any of the logged prices exceeds the minimum or maximum calculated prices
            if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
            if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
          }
        }

        // decreasing phase 1
        let rateMinVal = 0.8
        let rateMaxVal = 0.6
        for (let i = 0; i < decPhaseLen1; i++, work++) {
          possibleMinValues[work] = Math.ceil(rateMaxVal * baseMinPrice)
          possibleMaxValues[work] = Math.ceil(rateMinVal * baseMaxPrice)

          if (prices[work] !== '') {
            // Check if any of the logged prices exceeds the minimum or maximum calculated prices
            if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
            if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
          }

          rateMinVal -= 0.04
          rateMaxVal -= 0.1
        }

        // high phase 2
        for (let i = 0; i < highPhaseLen2and3 - highPhaseLen3; i++, work++) {
          possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
          possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)

          if (prices[work] !== '') {
            // Check if any of the logged prices exceeds the minimum or maximum calculated prices
            if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
            if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
          }
        }

        // decreasing phase 2
        rateMinVal = 0.8
        rateMaxVal = 0.6
        for (let i = 0; i < decPhaseLen2; i++, work++) {
          possibleMinValues[work] = Math.ceil(rateMaxVal * baseMinPrice)
          possibleMaxValues[work] = Math.ceil(rateMinVal * baseMaxPrice)

          if (prices[work] !== '') {
            // Check if any of the logged prices exceeds the minimum or maximum calculated prices
            if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
            if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
          }

          rateMinVal -= 0.04
          rateMaxVal -= 0.1
        }

        // high phase 3
        for (let i = 0; i < highPhaseLen3; i++, work++) {
          possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
          possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)

          if (prices[work] !== '') {
            // Check if any of the logged prices exceeds the minimum or maximum calculated prices
            if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
            if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
          }
        }
        validPeaks.push(true)
      }
    }
  }
  console.log("Pattern 0 valid peaks", validPeaks)
  return + (validPeaks.some(a => a))
}

const recognizePattern1 = (prices: priceList) => {
  // PATTERN 1: decreasing middle, high spike, random low
  const baseMinPrice = prices[0] || 90
  const baseMaxPrice = prices[0] || 110
  // Try each peak start place separately and match it to given prices.
  let validPeaks = []
  peakLoop:
  for (let peakStart = 3; peakStart <= 9; peakStart++) {
    let work = 0
    const possibleMinValues = getEmptyPriceList()
    const possibleMaxValues = getEmptyPriceList()

    let rateMinVal = .9
    let rateMaxVal = .85
    
    // Decreasing middle
    for (work = 2; work < peakStart; work++) {
      possibleMinValues[work] = Math.ceil(rateMaxVal * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(rateMinVal * baseMaxPrice)

      if (prices[work] !== '') {
        // Check if any of the logged prices exceeds the minimum or maximum calculated prices
        if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
        if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
      }
      
      rateMinVal -= .03
      rateMaxVal -= .05
    }

    // high spike
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(1.4 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(2 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(2 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(6 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(1.4 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(2 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    
    // Random low (Rate between 0.4 and 0.9)
    for (; work < 14; work++) {
      if (prices[work] !== '') {
        possibleMinValues[work] = Math.ceil(0.4 * baseMinPrice)
        possibleMaxValues[work] = Math.ceil(0.9 * baseMaxPrice)
        if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
      }
    }
    validPeaks.push(true)
  }
  console.log("Pattern 1 valid peaks", validPeaks)
  return + (validPeaks.some(a => a))
  // return (validPeaks.reduce((a, b) => a + b, 0)) // if need count of valid peaks
}

const recognizePattern2 = (prices: priceList) => {
  // PATTERN 2: consistently decreasing
  const baseMinPrice = prices[0] || 90
  const baseMaxPrice = prices[0] || 110
  const possibleMinValues = getEmptyPriceList()
  const possibleMaxValues = getEmptyPriceList()
  possibleMinValues[0] = baseMinPrice
  possibleMaxValues[0] = baseMaxPrice

  let rateMaxVal = .9
  let rateMinVal = .85

  for (let work = 2; work < 14; work++) {
    possibleMaxValues[work] = Math.ceil(rateMaxVal * baseMaxPrice)
    possibleMinValues[work] = Math.ceil(rateMinVal * baseMaxPrice)

    if (prices[work] !== '') {
      // Check if any of the logged prices exceeds the minimum or maximum calculated prices
      // and return 0 if the value exceeds to indicate pattern does not match given prices. 
      if (prices[work] > possibleMaxValues[work]) return 0
      if (prices[work] < possibleMinValues[work]) return 0
    }
    
    rateMaxVal -= .03
    rateMinVal -= .05
  }
  return 1
}

const recognizePattern3 = (prices: priceList) => { 
  // PATTERN 3: decreasing, spike, decreasing
  const baseMinPrice = prices[0] || 90
  const baseMaxPrice = prices[0] || 110

  let validPeaks = []

  peakLoop:
  for (let peakStart = 2; peakStart <= 9; peakStart++) {
    let work = 0
    const possibleMinValues = getEmptyPriceList()
    const possibleMaxValues = getEmptyPriceList()
    
    let rateMinVal = .9
    let rateMaxVal = .4

    // decreasing phase before the peak
    for (work = 2; work < peakStart; work++) {
      possibleMinValues[work] = Math.ceil(rateMaxVal * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(rateMinVal * baseMaxPrice)
      
      if (prices[work] !== '') {
        // Check if any of the logged prices exceeds the minimum or maximum calculated prices
        // and return 0 if the value exceeds to indicate pattern does not match given prices. 
        if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
        if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
      }
      
      rateMinVal -= .03
      rateMaxVal -= .05
    }

    // Peak, 5 price updates long
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(0.9 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(1.4 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    
    rateMinVal = 1.4; rateMaxVal = 2.0;

    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(1.4 * baseMinPrice) - 1
      possibleMaxValues[work] = Math.ceil(2.0 * baseMaxPrice) - 1
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    // Note: 4th updated price in peak should have the best price!
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(1.4 * baseMinPrice)
      possibleMaxValues[work] = Math.ceil(2.0 * baseMaxPrice)
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++
    if (prices[work] !== '') {
      possibleMinValues[work] = Math.ceil(1.4 * baseMinPrice) - 1
      possibleMaxValues[work] = Math.ceil(2.0 * baseMaxPrice) - 1
      if (prices[work] > possibleMaxValues[work] || prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
    }
    work++

    // decreasing phase after the peak
    rateMinVal = .4
    rateMaxVal = .9
    for (; work < 14; work++) {
      if (prices[work] !== '') {
        possibleMaxValues[work] = Math.ceil(rateMaxVal * baseMaxPrice)
        possibleMinValues[work] = Math.ceil(rateMinVal * baseMaxPrice)
    
        // Check if any of the logged prices exceeds the minimum or maximum calculated prices
        // and return 0 if the value exceeds to indicate pattern does not match given prices. 
        if (prices[work] > possibleMaxValues[work]) { validPeaks.push(false); continue peakLoop }
        if (prices[work] < possibleMinValues[work]) { validPeaks.push(false); continue peakLoop }
      }
      
      rateMaxVal -= .03
      rateMinVal -= .05
    }
    validPeaks.push(true)
  }
  return + (validPeaks.some(a => a))
}

const recognizePattern = (prices: priceList): IPattern => {
  return {
    pattern0: recognizePattern0(prices),
    pattern1: recognizePattern1(prices),
    pattern2: recognizePattern2(prices),
    pattern3: recognizePattern3(prices),
   }
}

export const TurnipWeekPredicter = observer((props) => {
  const { turnipPriceStore: tps } = useStores();
  const [ weekNumber, setWeekNumber ] = React.useState(props !== undefined ? props.weekNumber : undefined)
  // const { week, weekNumber } = props

  if (weekNumber !== undefined) {
    const weekTurnips = tps.getWeekTurnips(weekNumber)
    if (weekTurnips.length === 0) {
      return <div></div>
    }
    console.log(patterns)
    const prices = constructWeekPrices(weekTurnips)
    const potentialPatterns = recognizePattern(prices)
    console.log(weekNumber, '\n', JSON.stringify(prices))
    return (
      <div className={'week-prediction'}>
        <div className={"pattern-predictions-container"}>
          <div className={"pattern-prediction"}><h5>P0</h5><span>{potentialPatterns.pattern0 ? '❓' : '❌'}</span></div>
          <div className={"pattern-prediction"}><h5>P1</h5><span>{potentialPatterns.pattern1 ? '❓' : '❌'}</span></div>
          <div className={"pattern-prediction"}><h5>P2</h5><span>{potentialPatterns.pattern2 ? '❓' : '❌'}</span></div>
          <div className={"pattern-prediction"}><h5>P3</h5><span>{potentialPatterns.pattern3 ? '❓' : '❌'}</span></div>
        </div>
      </div>
    )
  }
  return null
})