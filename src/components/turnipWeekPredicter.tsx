import * as React from "react"
import { observer } from "mobx-react"

import { useStores } from "../stores/index"

import Pattern0SVG from "../images/pattern0.svg"
import Pattern1SVG from "../images/pattern1.svg"
import Pattern2SVG from "../images/pattern2.svg"
import Pattern3SVG from "../images/pattern3.svg"

export const TurnipWeekPredicter = observer((props) => {
  const { 
    turnipPriceStore: tps,
  } = useStores();
  const [weekNumber, setWeekNumber] = React.useState(props !== undefined ? props.weekNumber : undefined)
  const [year, setYear] = React.useState(props !== undefined ? props.date.getFullYear() : new Date().getFullYear())
  // const { week, weekNumber } = props

  if (weekNumber !== undefined) {
    const possiblePatterns = tps.predictWeek(weekNumber, year)
    return (
      <div className={'week-prediction'}>
        <div className={"pattern-predictions-container"}>
          {possiblePatterns.pattern0.probability
            ? <div className={"pattern-prediction"}><h5>P0<img src={Pattern0SVG} /></h5><p>Probability: {possiblePatterns.pattern0?.probability * 100 + "%"}</p></div>
            : null
          }
          {possiblePatterns.pattern1.probability
            ? <div className={"pattern-prediction"}><h5>P1<img src={Pattern1SVG} /></h5><p>Probability: {possiblePatterns.pattern1?.probability * 100 + "%"}</p></div>
            : null
          }
          {possiblePatterns.pattern2.probability
            ? <div className={"pattern-prediction"}><h5>P2<img src={Pattern2SVG} /></h5><p>Probability: {possiblePatterns.pattern2?.probability * 100 + "%"}</p></div>
            : null
          }
          {possiblePatterns.pattern3.probability
            ? <div className={"pattern-prediction"}><h5>P3<img src={Pattern3SVG} /></h5><p>Probability: {possiblePatterns.pattern3?.probability * 100 + "%"}</p></div>
            : null
          }

        </div>
      </div>
    )
  }
  return null
})