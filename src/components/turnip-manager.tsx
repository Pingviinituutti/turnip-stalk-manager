import * as React from "react"
import { observer } from "mobx-react"
import Calendar from 'react-calendar'
import { v4 as uuidv4 } from 'uuid';

import 'react-calendar/dist/Calendar.css';
import './calendar.css'

import { useStores } from "../stores/index"
import { date_to_string, ITurnip } from "../stores/TurnipPriceStore";
import { TurnipSundayDialog } from "./TurnipPriceModal";

export const TurnipPriceManager = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  return (
    <div>
      <h2>Turnip price catalog</h2>
      <ul>
        {tps.turnip_prices.map((tp, i) => {
          return <li key={i}>{tp.day}, {tp.price} B</li>;
        })}
      </ul>
      <button onClick={() => tps.addTurnipPrice(new Date(), 'afternoon', 101)}>Add Turnip price</button>
    </div>
  )
})

export const TurnipCalendar = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  const tileColor = ({date, view}) => {
    if (view === 'month') {
      if (!date.getDay()) return 'turnip-buy-day'
      return 'turnip-sell-day'
    }
  }

  const RenderOtherPrices = (morning_tp: ITurnip, noon_tp: ITurnip) => {
    return (
      <>
        <div className={'turnip-sell-day'}>
          <span>M: {morning_tp ? morning_tp.price : '?'} B</span>
        </div>
        <div className={'turnip-sell-day'}>
          <span>N: {noon_tp ? noon_tp.price : '?'} B</span>
        </div>
      </>
    )
  }
  
  const RenderSundayPrices = (tp: ITurnip, key: string) => {
    return (
      <TurnipSundayDialog turnip={tp} propKey={key} onValueChange={tps.updateTurnipPrice}/>
    )
  }
  
  const tileContent = ({date, view}) => {
    if (view === 'month') {
      const tile_uuid = uuidv4();
      if (!date.getDay()) {
        let turnip: ITurnip = tps.getTurnipFromDate(date)[0]
        if (turnip === undefined) turnip = {day: date_to_string(date), time: 'morning'}
        return RenderSundayPrices(turnip, tile_uuid)
      } else {
        const morning = tps.getTurnipFromDateAndTime(date, 'morning')[0]
        const afternoon = tps.getTurnipFromDateAndTime(date, 'afternoon')[0]
        return RenderOtherPrices(morning, afternoon)
      }
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