import { makeAutoObservable, autorun, runInAction, makeObservable, action, observable } from "mobx"

export class TurnipPriceStore {
    turnip_prices: TurnipPrice[] = []
    // isLoading = true
    constructor() {
      makeObservable(this, {
        turnip_prices: observable,
        createTurnipPrice: action,
        removeTurnipPrice: action,
      })
      this.createTurnipPrice(new Date(), 'morning', 100)
      const storedJson = localStorage.getItem('TurnipPriceStore')
      if (storedJson) Object.assign(this, JSON.parse(storedJson))
      autorun(() => {
        console.log("Saving current state to local storage.")
        localStorage.setItem('TurnipPriceStore', JSON.stringify(this))
      })
    }

    // // Fetches all TurnipPrices from the server.
    // loadTurnipPrices() {
    //     this.isLoading = true
    //     this.transportLayer.fetchTurnipPrices().then(fetchedTurnipPrices => {
    //         runInAction(() => {
    //             fetchedTurnipPrices.forEach(json => this.updateTurnipPriceFromServer(json))
    //             this.isLoading = false
    //         })
    //     })
    // }

    // Creates a fresh TurnipPrice on the client and the server.
    createTurnipPrice(day: Date, time: priceTime, price: number) {
        const turnip_price = new TurnipPrice(this, day, time, price)
        this.turnip_prices.push(turnip_price)
        return turnip_price
    }

    // A TurnipPrice was somehow deleted, clean it from the client memory.
    removeTurnipPrice(turnip_price) {
        this.turnip_prices.splice(this.turnip_prices.indexOf(turnip_price), 1)
        // turnip_price.dispose()
    }
}

export type priceTime = 'morning' | 'afternoon'

// Domain object TurnipPrice.
export class TurnipPrice {
    day: string
    time: priceTime
    price: number
    // saveHandler = null

    constructor(store, day: (string|Date), time, price) {
        makeAutoObservable(this, {
            // dispose: false
        })
        console.log(day, new Date(day), new Date(day).toDateString())
        if (typeof day === 'string') {
          this.day = day
        } else{
          this.day = day.toDateString().split('T')[0]
        }
        this.time = time
        this.price = price
    }

    // Remove this TurnipPrice from the client and the server.
    delete() {
        // this.store.removeTurnipPrice(this)
    }

    get asJson() {
        return {
            day: this.day,
            time: this.time,
            price: this.price,
        }
    }

    // Update this TurnipPrice with information from the server.
    updateFromJson(json) {
        this.day = json.day
        this.time = json.time
        this.price = json.price
    }

    // // Clean up the observer.
    // dispose() {
    //     this.saveHandler()
    // }
}