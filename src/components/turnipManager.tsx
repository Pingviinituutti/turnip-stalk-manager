import * as React from "react"
import { observer } from "mobx-react"
import Calendar from 'react-calendar'
import { v4 as uuidv4 } from 'uuid'
import { compressToEncodedURIComponent as compress } from 'lz-string'
import { MdShare, MdContentCopy } from "react-icons/md/"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './calendar.scss'

import { useStores } from "../stores/index"
import { TurnipPriceDialog } from "./TurnipPriceDialog";
import { TurnipWeekPredicter } from "./turnipWeekPredicter";
import { date2datestr } from "./helpers";
import { ITurnip } from "./TurnipTypes";

const share2Navigator = (id: string) => {
  const elem = document.getElementById(id) as HTMLTextAreaElement
  if (elem === undefined) return
  if (navigator.share) {
    navigator.share({
      title: 'Turnip Stalk Manager',
      text: 'Take a look at my turnip prices!',
      url: elem.value,
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  } else {
    console.log('Share not supported on this browser, do it the old way.');
    copy2Clipboard(id, "Copied link to clipboard!")
  }
}

const copy2Clipboard = (id: string, message = "JSON copied to clipboard!") => {
  const elem = document.getElementById(id) as HTMLTextAreaElement
  if (elem !== undefined) {
    elem.select()
    document.execCommand('copy')
    elem.selectionStart = elem.selectionEnd = -1
    elem.blur()
    toast.success(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    })
  }
}

export const TurnipJSONArea = observer(() => {
  if (typeof window === 'undefined') return (<div className={'JSON-area'} />)
  const { turnipPriceStore: tps } = useStores()
  const turnips = tps.getTurnips()
  const json_turnips = JSON.stringify(turnips)

  return (
    <div className={'JSON-area'}>
      <h2>Turnip price data JSON</h2>
      <div className={'JSON-container'}>
        <textarea
          id={'turnip-json-textarea'}
          className={'turnip-json-data'}
          value={json_turnips}
          readOnly
        />
        <button title={"Copy turnip JSON to clipboard"} onClick={() => copy2Clipboard('turnip-json-textarea')}><MdContentCopy /></button>
      </div>
    </div>
  )
})

export const TurnipShareLink = observer(() => {
  if (typeof window !== 'undefined') {
    const { turnipPriceStore: tps } = useStores()
    const turnips = tps.getTurnips()
    const json_turnips = JSON.stringify(JSON.parse(JSON.stringify(turnips)))
    const compressed_turnips = compress(json_turnips)
    const json_url = new URL(typeof window !== 'undefined' ? window.location.href : '')
    const compressed_url = new URL(typeof window !== 'undefined' ? window.location.href : '')
    json_url.searchParams.set('data', encodeURIComponent(JSON.stringify(JSON.parse(json_turnips))))
    compressed_url.searchParams.set('data', compressed_turnips)

    return (
      <div className={'turnip-share-link'}>
        <button title={"Copy link"} onClick={() => share2Navigator('turnip-json-textarea-encoded')}><MdShare /></button>
        <h2>Share your turnip prices (or save for own use)</h2>
        <textarea
          hidden
          id={'turnip-json-textarea-encoded'}
          className={'turnip-json-data encoded'}
          value={compressed_url.toString()}
          readOnly
        />
      </div>
    )
  }
  return <div className={'turnip-share-link'} />
})

export const TurnipCalendar = observer(() => {
  const { turnipPriceStore: tps } = useStores();

  const tileColor = ({ date = new Date(), view = '' }) => {
    if (view === 'month') {
      if (!date.getDay()) return 'turnip-buy-day-tile'
      return 'turnip-sell-day-tile'
    }
  }

  const tileContent = ({ date = new Date(), view = '', weekNumber = -1 }) => {
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
      return (
        <TurnipPriceDialog
          morningTurnip={morningTurnip}
          noonTurnip={noonTurnip}
          tileUuid={tile_uuid}
        />
      )
    } else if (view === 'week-number') {
      return (
        <TurnipWeekPredicter
          date={date}
          weekNumber={weekNumber}
        />
      )
    }
  }

  return (
    <Calendar
      value={new Date()}
      // @ts-ignore
      tileContent={tileContent}
      tileClassName={tileColor}
      showWeekNumbers
      calendarType={'US'}
    />
  )
})