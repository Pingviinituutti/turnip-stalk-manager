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
    const possiblePatterns = tps.predictWeek(props.weekNumber, year)
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

      </div>
    )
  }
  return null
})