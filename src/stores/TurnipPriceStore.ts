import { autorun, makeObservable, action, observable } from "mobx"
import { decompressFromEncodedURIComponent as decompress } from 'lz-string'
// @ts-ignore
import { getWeekNumber } from 'react-calendar/src/shared/dates'
import { IPattern, IPatternMinMax, IPredictions, ITurnip, Time, TPredictions, TWeekPrices } from "../components/TurnipTypes";
import { date2datestr, getEmptyPriceList, isValidDate, CALENDAR_TYPES } from "../components/helpers";

const calculateNumPossiblePatterns = (patterns: IPredictions) => {
  return Object.values(patterns).reduce((acc, prev) => (acc + (+ (prev.possiblePatterns?.mins.length > 0))), 0)
}

export class TurnipPriceStore {
  turnips: ITurnip[] = []
  // isLoading = true
  constructor() {
    makeObservable(this, {
      turnips: observable,
      addTurnip: action,
      addTurnipPrice: action,
      deleteTurnipPrice: action,
      deleteTurnipAtIndex: action,
      updateTurnipPrice: action,
      cleanTurnips: action,
    })
    if (typeof window !== 'undefined') {
      const url_turnips = new URLSearchParams(window.location.search).get('data')
      const decompressed_turnips = (url_turnips !== null ? decompress(url_turnips) : null)
      if (decompressed_turnips !== null) {
        console.log("Loading turnips from URL.")
        this.turnips = JSON.parse(decompressed_turnips)
        window.history.pushState({}, document.title, "/")
      } else {
        console.log("Loading turnips from local storage.")
        const storedJson = localStorage.getItem('TurnipPriceStore')
        if (storedJson) {
          Object.assign(this, JSON.parse(storedJson))
        }
      }
      this.cleanTurnips()
    }
    autorun(() => {
      console.log("Saving current state to local storage.")
      if (typeof window !== 'undefined') localStorage.setItem('TurnipPriceStore', JSON.stringify(this))
    })
  }

  public getTurnips = () => {
    return this.turnips
  }

  // Creates a fresh TurnipPrice on the client and the server.
  addTurnipPrice(day: (Date | string), time: Time, price: number) {
    const str_date = (typeof day === 'string' ? day : date2datestr(day))
    if (str_date.includes('Sun')) {
      if (this.getTurnipFromDate(str_date).length === 0) {
        const turnip: ITurnip = { day: str_date, time: 'morning', price: price }
        this.turnips.push(turnip)
        return turnip
      }
    } else {
      if (this.getTurnipFromDateAndTime(str_date, time).length === 0) {
        const turnip = { day: str_date, time: time, price: price }
        this.turnips.push(turnip)
        return turnip
      }

    }

    console.log(`Turnip price already exists for date ${day}.`)
  }

  addTurnip(turnip: ITurnip) {
    const new_turnip = turnip
    if (typeof new_turnip.day === 'string' && isValidDate(new Date(new_turnip.day))) {
      if (new_turnip.price !== undefined) {
        if (turnip.day.includes('Sun') && turnip.time !== 'morning') new_turnip.time = 'morning'
        if (new_turnip.time === 'morning' || (new_turnip.time === 'afternoon')) {
          this.turnips.push(new_turnip)
          console.log("Added new turnip", JSON.stringify(new_turnip))
          return new_turnip
        }
      } else {
        console.log("Turnip price can't be undefined")
      }
    } else {
      console.log(`Turnip date '${turnip.day}' is invalid`)
    }
  }

  deleteTurnipPrice(day: (Date | string), time: Time) {
    const str_date = (typeof day === 'string' ? day : date2datestr(day))
    for (const [i, t] of this.turnips.entries()) {
      if (t.day === str_date && t.time === time) {
        console.log("Deleting turnip", i, JSON.stringify(t))
        this.turnips.splice(i, 1)
        break
      }
    }
  }

  get getSundayTurnipPrices() {
    return this.turnips.filter(tp => tp.day.includes('Sun'))
  }

  public turnipExists = (turnip: ITurnip) => {
    return this.getTurnipIndex(turnip) !== undefined
  }

  deleteTurnipAtIndex(index: number) {
    console.log(`Deleting turnip at index ${index}: `, JSON.stringify(this.turnips[index]))
    this.turnips.splice(index, 1)
  }

  updateTurnipPrice = (turnip: ITurnip) => {
    const turnip_index = this.getTurnipIndex(turnip)
    if (turnip_index !== undefined) {
      if (turnip.price !== undefined) {
        if (turnip.day.includes('Sun')) {
          if (turnip.price < 90 || 110 < turnip.price) {
            console.log("Buy price can't be less than 90 or more than 110 bells.")
            return
          } else {
            console.log("Updating turnip price", this.turnips[turnip_index], JSON.stringify(turnip.price))
            this.turnips[turnip_index].price = turnip.price
          }
        } else {
          console.log("Updating turnip price", this.turnips[turnip_index], JSON.stringify(turnip.price))
          this.turnips[turnip_index].price = turnip.price
        }
      } else {
        console.log(`Price can't be undefined`)
        this.deleteTurnipAtIndex(turnip_index)
      }
    } else {
      if (turnip.price !== undefined) {
        this.addTurnip(turnip)
      }
    }
  }

  cleanTurnips = () => {
    this.turnips = this.turnips.filter(tp => tp.price)
  }

  public getTurnipIndex = (turnip: ITurnip) => {
    for (const [i, t] of this.turnips.entries()) {
      if (t.day === turnip.day && t.time === turnip.time) return i
    }
    return undefined
  }

  public getTurnipFromDate = (day: (string | Date)) => {
    if (typeof day === 'string') {
      return this.turnips.filter(tp => (tp.day === day))
    }
    return this.turnips.filter(tp => (tp.day === date2datestr(day)))
  }

  public getWeekTurnips = (week: number, year = new Date().getFullYear()) => {
    if (week === undefined) return []
    return this.turnips.filter(t => getWeekNumber(new Date(t.day), CALENDAR_TYPES.US) === week && new Date(t.day).getFullYear() === year)
  }

  public getTurnipFromDateAndTime = (day: string, time: Time) => {
    if (typeof day === 'string') {
      return this.turnips.filter(tp => (tp.day === day && tp.time === time))
    }
    return this.turnips.filter(tp => (tp.day === date2datestr(day) && tp.time === time))
  }

  // Predictions part
  public predictWeek(week: number, year: number) {
    const turnips = this.getWeekTurnips(week, year)
    const prices = constructWeekPrices(turnips)

    const prevTurnips = this.getWeekTurnips(week - 1, year)
    const prevPrices = constructWeekPrices(prevTurnips)

    const prediction: TPredictions = {
      pattern0: { probability: 0},
      pattern1: { probability: 0},
      pattern2: { probability: 0},
      pattern3: { probability: 0},
    }

    let k: keyof typeof prediction

    if (prevTurnips.length === 0 || prevPrices.slice(2).every(p => p === '')) {
      // If previous week has no prices, just recognise current pattern 
      // But only if we have some sell prices defined
      if ((turnips.length > 0 || prices.slice(2).some(p => p !== ''))) {
        console.log(`Trying to recognize pattern for week ${week}`)
        const currentPattern = getPossiblePatterns(prices)
        const numPossiblePatterns = calculateNumPossiblePatterns(currentPattern)
        console.log("Number of possible patterns in week " + (week) + ": " + numPossiblePatterns)
  
        for (k in currentPattern) {
          if (currentPattern[k].possiblePatterns.mins.length > 0) {
            prediction[k].probability = 1 / numPossiblePatterns
          }
        }
        console.log("Current week probabilities: ", JSON.stringify(prediction))
      }
    }
    else {
      // Else previous week has prices, recognise its pattern!
      console.log(`Trying to recognize pattern for previous week ${week - 1}`)
      const previousPattern = getPossiblePatterns(prevPrices)
      console.log(`Previous week (${week - 1}) possible patterns: `, previousPattern)
      const numPossiblePreviousPatterns = calculateNumPossiblePatterns(previousPattern)
      console.log(`Number of possible patterns in previous week (${week - 1}): ${numPossiblePreviousPatterns}`)

      if (turnips.length === 0 || prices.slice(2).every(p => p === '')) {
        // If there are no prices for current week yet, predict according to previous weeks possible patterns
        for (k in previousPattern) {
          if (previousPattern[k].possiblePatterns?.mins.length > 0) {
            const patternNumber = parseInt(k.slice(-1))
            const probabilities = nextPatternProbabilities(patternNumber)
            console.log("Next pattern probabilities: ", probabilities)
            prediction.pattern0.probability += probabilities.pattern0 / numPossiblePreviousPatterns
            prediction.pattern1.probability += probabilities.pattern1 / numPossiblePreviousPatterns
            prediction.pattern2.probability += probabilities.pattern2 / numPossiblePreviousPatterns
            prediction.pattern3.probability += probabilities.pattern3 / numPossiblePreviousPatterns
          }
        }
      } else {
        // Else, recognise previous week pattern
        const currentPattern = getPossiblePatterns(prices)
        console.log(`Current week (${week}) possible patterns: `, currentPattern)
        
        for (k in previousPattern) {
          if (k in previousPattern && previousPattern[k].possiblePatterns?.mins.length > 0) {
            const patternNumber = parseInt(k.slice(-1))
            const probabilities = nextPatternProbabilities(patternNumber)
            Object.keys(currentPattern).forEach((k: keyof typeof prediction, index) => {
              if (currentPattern[k].possiblePatterns?.mins.length > 0) {
                prediction[k].probability += probabilities[k]
              }
            })
          }
        }
        // Normalize probabilities
        const tot = Object.values(prediction).reduce((acc, pred) => (acc + pred.probability), 0)
        for (k in prediction) { prediction[k].probability /= tot }
      }
    }
    return prediction
  }
}

const getPossiblePatterns = (prices: TWeekPrices) => {
  const possible: IPredictions = {
    pattern0: { possiblePatterns: filterPossible(prices, PATTERNS.pattern0)},
    pattern1: { possiblePatterns: filterPossible(prices, PATTERNS.pattern1)},
    pattern2: { possiblePatterns: filterPossible(prices, PATTERNS.pattern2)},
    pattern3: { possiblePatterns: filterPossible(prices, PATTERNS.pattern3)},
  }
  return possible
}

export const constructWeekPrices = (turnips: ITurnip[]) => {
  const buy_price = turnips.filter(t => t.day.includes('Sun'))[0]?.price
  const sell_prices: TWeekPrices = getEmptyPriceList()
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

import PATTERNS from "../components/turnipWeekPatterns"

export const filterPossible = (prices: TWeekPrices, patterns: IPatternMinMax) => {
  const basePrice = prices[0]
  if (basePrice > 0 && basePrice !== '') {
    let { mins, maxs } = patterns
    const possible: IPatternMinMax = { mins: [], maxs: [] }

    for (let i = 0; i < mins.length; i++) {
      const possibilities = []
      for (let j = 0; j < prices.length; j++) {
        if (j < 2 || prices[j] === '') {
          possibilities.push(true)
        } else {
          const p = prices[j] || 0
          const min = mins[i][j] || 0
          const max = maxs[i][j] || 0
          if (p && min && max) {
            // const diffMin = min * basePrice - (p)
            // const diffMax = max * basePrice - (p)
            if (min * basePrice <= p && Math.ceil(max * basePrice) >= p) {
              possibilities.push(true)
            } else {
              // if (p && min && min > 0 && Math.abs(diffMin) < 3) console.log(`Buy price: ${basePrice}, current rate: ${min}, current price ${p}, compared price ${min * basePrice}, Min possibility missed by ${diffMin.toFixed(2)}`)
              // if (p && max && max > 0 && Math.abs(diffMax) < 3) console.log(`Buy price: ${basePrice}, current rate: ${max}, current price ${p}, compared price ${max * basePrice}, Max possibility missed by ${diffMax.toFixed(2)}`)
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

export const constructPatternProbability = (p0: number, p1: number, p2: number): IPattern => {
  const tot = 100
  return {
    pattern0: p0 / tot,
    pattern1: (p1 - p0) / tot,
    pattern2: (p2 - p1) / tot,
    pattern3: (tot - p2) / tot,
  }
}

export const nextPatternProbabilities = (pattern: number) => {
  let chance: IPattern
  if (pattern > 3) {
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