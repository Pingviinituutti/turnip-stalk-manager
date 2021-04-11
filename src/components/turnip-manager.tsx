import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"

export const TurnipPriceManager = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  return (
    <div>
      <h2>Turnip price catalog</h2>
      <ul>
        {tps.turnip_prices.map((tp, i) => {
          return <li key={i}>{tp.day}, {tp.price} Bells</li>;
        })}
      </ul>
      <button onClick={() => tps.createTurnipPrice(new Date(), 'afternoon', 101)}>Add Turnip price</button>
    </div>
  )
})