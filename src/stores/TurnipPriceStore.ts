import { turn } from "core-js/core/array"
import { makeAutoObservable, autorun, runInAction, makeObservable, action, observable } from "mobx"

export const date_to_string = (date: Date): string => {
  return date.toDateString().split('T')[0]
}

export type Time = 'morning' | 'afternoon'

export interface ITurnip {
  day: string
  time: Time
  price?: number
}

export class TurnipPriceStore {
    turnip_prices: ITurnip[] = []
    // isLoading = true
    constructor() {
      makeObservable(this, {
        turnip_prices: observable,
        addTurnipPrice: action,
        removeTurnipPrice: action,
        updateTurnipPrice: action,
      })
      this.addTurnipPrice(new Date(), 'morning', 100)
      const storedJson = localStorage.getItem('TurnipPriceStore')
      if (storedJson) Object.assign(this, JSON.parse(storedJson))
      autorun(() => {
        // console.log("Cleaning turnips local storage.")
        // this.cleanTurnips()
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
            this.turnip_prices.push(turnip)
            return turnip
          }
        } else {
          if (this.getTurnipFromDateAndTime(str_date, time).length === 0) {
            const turnip = { day: str_date, time: time, price: price }
            this.turnip_prices.push(turnip)
            return turnip
          }

        }

        console.log(`Turnip price already exists for date ${day}.`)
    }

    // A TurnipPrice was somehow deleted, clean it from the client memory.
    removeTurnipPrice(turnip_price) {
        this.turnip_prices.splice(this.turnip_prices.indexOf(turnip_price), 1)
    }

    get getSundayTurnipPrices() {
      return this.turnip_prices.filter(tp => tp.day.includes('Sun'))
    }

    public turnipExists = (turnip: ITurnip) => {
      if (turnip.day.includes('Sun')) {
        return (this.getTurnipFromDate(turnip.day).length > 0)
      }
      return (this.getTurnipFromDateAndTime(turnip.day, turnip.time).length > 0)
    }

    updateTurnipPrice = (turnip: ITurnip) => {
      if (this.turnipExists(turnip)) {
        if (turnip.day.includes('Sun')) {
          const updatedTurnipPrices = this.turnip_prices.map( tp => {
            if (tp.day === turnip.day && tp.time) return {...turnip}
            return tp
          })
          this.turnip_prices = updatedTurnipPrices
        } else {
          // const day_str = (typeof day === 'string' ? day : date_to_string(day))
          const updatedTurnipPrices = this.turnip_prices.map( tp => {
            if (tp.day === turnip.day && tp.time === turnip.time) return {...turnip}
            return tp
          })
          this.turnip_prices = updatedTurnipPrices
        }
      }
    }

    cleanTurnips = () => {
      this.turnip_prices = this.turnip_prices.filter(tp => tp.price)
    }

    public getTurnipFromDate = (day: (string | Date)) => {
      if (typeof day === 'string') {
        return this.turnip_prices.filter(tp => (tp.day === day))
      }
      return this.turnip_prices.filter(tp => (tp.day === date_to_string(day)))
    }
    
    public getTurnipFromDateAndTime = (day: string, time: Time) => {
      if (typeof day === 'string') {
        return this.turnip_prices.filter(tp => (tp.day === day && tp.time === time))
      }
      return this.turnip_prices.filter(tp => (tp.day === date_to_string(day) && tp.time === time))
    }
}
