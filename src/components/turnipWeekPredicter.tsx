import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"

interface TurnipWeekPredicterProps {
  weekNumber: number
  date: Date
}

export const TurnipWeekPredicter = observer((props: TurnipWeekPredicterProps) => {
  const { 
    turnipPriceStore: tps,
  } = useStores();
  const [year, _] = React.useState(props !== undefined ? props.date.getFullYear() : new Date().getFullYear())

  if (props.weekNumber !== undefined) {
    const { 
      prediction: possiblePatterns, 
      prices,
      previousPattern
    } = tps.predictWeek(props.weekNumber, year)
    prices.splice(1,1)
    const prophetPrevPattern = (previousPattern !== '' ? previousPattern.substring(0, 7) + '=' + previousPattern.substring(7, previousPattern.length) : '')
    const prophetURL = `https://turnipprophet.io?prices=${prices.join('.')}${previousPattern !== '' ? '&' + prophetPrevPattern : ''}`
    return (
      <div className={"pattern-predictions-container"}>
        {possiblePatterns.pattern0.probability
          ? <div className={"pattern-prediction"}><p>Fluct.:</p><p>{`${(possiblePatterns.pattern0?.probability * 100).toFixed()}%`}</p></div>
          : null
        }
        {possiblePatterns.pattern1.probability
          ? <div className={"pattern-prediction"}><p>L Spike:</p><p>{`${(possiblePatterns.pattern1?.probability * 100).toFixed()}%`}</p></div>
          : null
        }
        {possiblePatterns.pattern2.probability
          ? <div className={"pattern-prediction"}><p>Decr:</p><p>{`${(possiblePatterns.pattern2?.probability * 100).toFixed()}%`}</p></div>
          : null
        }
        {possiblePatterns.pattern3.probability
          ? <div className={"pattern-prediction"}><p>S Spike:</p><p>{`${(possiblePatterns.pattern3?.probability * 100).toFixed()}%`}</p></div>
          : null
        }
        {prices.some(p => p !== '') && !(possiblePatterns.pattern0.probability || possiblePatterns.pattern1.probability || possiblePatterns.pattern2.probability || possiblePatterns.pattern3.probability)
            ? <p>Prediction failed</p>
            : null
        }
        {
          prices.some(p => p !== '') ? <a href={prophetURL} className={"prophet-url"} target="_blank">Possible prices</a> : null
        }
      </div>
    )
  }
  return null
})