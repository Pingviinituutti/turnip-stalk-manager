import * as React from "react"
import { observer } from "mobx-react"
import Calendar from 'react-calendar'
import { v4 as uuidv4 } from 'uuid';

import 'react-calendar/dist/Calendar.css';
import './calendar.css'

import { useStores } from "../stores/index"
import { date_to_string, ITurnip } from "../stores/TurnipPriceStore";
import { TurnipPriceDialog } from "./TurnipPriceDialog";

export const TurnipPriceManager = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  return (
    <div>
      <h2>Turnip price catalog</h2>
      <ul>
        {tps.turnips.map((tp, i) => {
          return <li key={i}>{tp.day}, {tp.time}. Price: {tp.price} Bells</li>;
        })}
      </ul>
      <button onClick={() => tps.addTurnipPrice(new Date(), 'afternoon', 101)}>Add Turnip price</button>
    </div>
  )
})

export const TurnipCalendar = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  const tileColor = ({ date, view }) => {
    if (view === 'month') {
      if (!date.getDay()) return 'turnip-buy-day'
      return 'turnip-sell-day'
    }
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const tile_uuid = uuidv4();
      const date_str = date_to_string(date)
      let morningTurnip: ITurnip = tps.getTurnipFromDateAndTime(date_str, 'morning')[0]
      if (morningTurnip === undefined) morningTurnip = { day: date_str, time: 'morning', price: undefined }
      let noonTurnip: ITurnip = undefined
      if (date.getDay() !== 0) { // if day is not Sunday, also add a afternoon turnip
        noonTurnip = tps.getTurnipFromDateAndTime(date_str, 'afternoon')[0]
        if (noonTurnip === undefined) noonTurnip = { day: date_str, time: 'afternoon', price: undefined }
      }
      return <TurnipPriceDialog
        morningTurnip={morningTurnip}
        noonTurnip={noonTurnip}
        propKey={tile_uuid}
      />
    }
  }

  return (
    <>
      <Calendar
        value={new Date()}
        tileContent={tileContent}
        tileClassName={tileColor}
        showWeekNumbers
        calendarType={'US'}
      />
    </>
  )
})