import { makeAutoObservable, autorun, makeObservable, action, observable } from "mobx"
import { CALENDAR_TYPES } from "react-calendar/src/shared/const";

import { getWeekNumber } from 'react-calendar/src/shared/dates'

export const date_to_string = (date: Date): string => {
  return date.toDateString()
}

function isValidDate(d) {
  // @ts-ignore
  return d instanceof Date && !isNaN(d);
}

export type Time = 'morning' | 'afternoon'

export interface ITurnip {
  day: string
  time: Time
  price?: number
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
    // this.time_to_clean = 0
    // this.addTurnipPrice(new Date(), 'morning', 100)
    const storedJson = localStorage.getItem('TurnipPriceStore')
    if (storedJson) Object.assign(this, JSON.parse(storedJson))
    this.cleanTurnips()
    autorun(() => {
      // if (this.time_to_clean > this.clean_interval) {
      //   this.cleanTurnips()
      // } else {
      //   this.time_to_clean++
      // }
      console.log("Saving current state to local storage.")
      localStorage.setItem('TurnipPriceStore', JSON.stringify(this))
    })
  }

  // Creates a fresh TurnipPrice on the client and the server.
  addTurnipPrice(day: (Date | string), time: Time, price: number) {
    const str_date = (typeof day === 'string' ? day : date_to_string(day))
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
    const str_date = (typeof day === 'string' ? day : date_to_string(day))
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
    return this.turnips.filter(tp => (tp.day === date_to_string(day)))
  }

  public getWeekTurnips = (week: number) => {
    if (week === undefined) return []
    return this.turnips.filter(t => getWeekNumber(new Date(t.day), CALENDAR_TYPES.US) === week)
  }

  public getTurnipFromDateAndTime = (day: string, time: Time) => {
    if (typeof day === 'string') {
      return this.turnips.filter(tp => (tp.day === day && tp.time === time))
    }
    return this.turnips.filter(tp => (tp.day === date_to_string(day) && tp.time === time))
  }
}
