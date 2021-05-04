import * as React from "react"
import { observer } from "mobx-react"
import Calendar from 'react-calendar'
import { v4 as uuidv4 } from 'uuid'
import { compressToEncodedURIComponent as compress } from 'lz-string'

// import 'react-calendar/dist/Calendar.css';
import './calendar.css'

import { useStores } from "../stores/index"
import { TurnipPriceDialog } from "./TurnipPriceDialog";
import { TurnipWeekPredicter } from "./turnipWeekPredicter";
import { date2datestr } from "./helpers";
import { ITurnip } from "./TurnipTypes";

const copyToClipboard = (id: string) => {
  const elem = document.getElementById(id) as HTMLTextAreaElement
  if (elem !== undefined) {
    elem.select()
    document.execCommand('copy')
    elem.selectionStart = elem.selectionEnd = -1
  }
}

export const TurnipPriceManager = observer(() => {
  if (typeof window === 'undefined') return null
  const { turnipPriceStore: tps } = useStores()
  const turnips = tps.getTurnips()
  const json_turnips = JSON.stringify(JSON.parse(JSON.stringify(turnips)))
  const compressed_turnips = compress(json_turnips)
  const json_url = new URL(typeof window !== 'undefined' ? window.location.href : '')
  const compressed_url = new URL(typeof window !== 'undefined' ? window.location.href : '')
  json_url.searchParams.set('data', encodeURIComponent(JSON.stringify(JSON.parse(json_turnips))))
  compressed_url.searchParams.set('data', compressed_turnips)

  return (
    <div>
      <h2>Turnip price data JSON</h2>
      <textarea 
        id={'turnip-json-textarea'}
        className={'turnip-json-data'}
        value={json_turnips}
        readOnly
      ></textarea>
      <button onClick={() => copyToClipboard('turnip-json-textarea')}>📋</button>
      <textarea 
        id={'turnip-json-textarea-encoded'}
        className={'turnip-json-data'}
        value={compressed_url.toString()}
        readOnly
      ></textarea>
      <button onClick={() => copyToClipboard('turnip-json-textarea-encoded')}>📋</button>
    </div>
  )
})

export const TurnipCalendar = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  const tileColor = ({ date = new Date(), view = '' }) => {
    if (view === 'month') {
      if (!date.getDay()) return 'turnip-buy-day'
      return 'turnip-sell-day'
    }
  }

  const tileContent = ({ date = new Date(), view = '', weekNumber = -1}) => {
    const tile_uuid = uuidv4();
    if (view === 'month') {
      const date_str = date2datestr(date)
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
        tileUuid={tile_uuid}
      />
    } else if (view === 'week-number') {
      // const date_str = date_to_string(date)
      return (
        <TurnipWeekPredicter 
          date={date}
          weekNumber={weekNumber}
        />
      )
    }
  }

  return (
    <>
      <Calendar
        value={new Date()}
        // @ts-ignore
        tileContent={tileContent}
        tileClassName={tileColor}
        showWeekNumbers
        calendarType={'US'}
      />
    </>
  )
})