import { IPatternContainer } from "./TurnipTypes"

const getEmptyPriceList = () => { return Array(14).fill('') }

const getPattern0Multipliers = () => { 
  // PATTERN 0: high, decreasing, high, decreasing, high
  let work = 0

  const maxs = []
  const mins = []
  for (let decPhaseLen1 = 2; decPhaseLen1 <= 3; decPhaseLen1++) {
    const decPhaseLen2 = 5 - decPhaseLen1
    
    for (let highPhaseLen1 = 0; highPhaseLen1 <= 6; highPhaseLen1++) {
      let highPhaseLen2and3 = 7 - highPhaseLen1
      
      peakLoop:
      for (let highPhaseLen3 = 0; highPhaseLen3 <= highPhaseLen2and3 - 1; highPhaseLen3++) {
        const minMultis = getEmptyPriceList()
        const maxMultis = getEmptyPriceList()

        work = 2

        // high phase 1
        for (let i = 0; i < highPhaseLen1; i++, work++) {
          minMultis[work] = 0.9
          maxMultis[work] = 1.4
        }

        // decreasing phase 1
        let rateMinVal = 0.8
        let rateMaxVal = 0.6
        for (let i = 0; i < decPhaseLen1; i++, work++) {
          minMultis[work] = rateMaxVal
          maxMultis[work] = rateMinVal

          rateMinVal -= 0.04
          rateMaxVal -= 0.10
        }

        // high phase 2
        for (let i = 0; i < highPhaseLen2and3 - highPhaseLen3; i++, work++) {
          minMultis[work] = 0.9
          maxMultis[work] = 1.4
        }

        // decreasing phase 2
        rateMinVal = 0.8
        rateMaxVal = 0.6
        for (let i = 0; i < decPhaseLen2; i++, work++) {
          minMultis[work] = rateMaxVal
          maxMultis[work] = rateMinVal

          rateMinVal -= 0.04
          rateMaxVal -= 0.10
        }

        // high phase 3
        for (let i = 0; i < highPhaseLen3; i++, work++) {
          minMultis[work] = 0.9
          maxMultis[work] = 1.4
        }
        mins.push(minMultis)
        maxs.push(maxMultis)
      }
    }
  }
  console.log("Pattern 0 min ultipliers", mins)
  console.log("Pattern 0 max ultipliers", maxs)
  return {
    mins: mins,
    maxs: maxs
  }
}

const getPattern1Multipliers = () => {
  // PATTERN 1: decreasing middle, high spike, random low
  const maxs = []
  const mins = []

  for (let peakStart = 3; peakStart <= 9; peakStart++) {
    let work = 0
    const minMultis = getEmptyPriceList()
    const maxMultis = getEmptyPriceList()

    let rateMinVal = .9
    let rateMaxVal = .85
    
    // Decreasing middle
    for (work = 2; work < peakStart; work++) {
      minMultis[work] = rateMaxVal
      maxMultis[work] = rateMinVal
      
      rateMinVal -= 0.03
      rateMaxVal -= 0.05
    }

    // high spike
    minMultis[work] = 0.9
    maxMultis[work] = 1.4
    work++
    minMultis[work] = 1.4
    maxMultis[work] = 2.0
    work++
    minMultis[work] = 2.0
    maxMultis[work] = 6.0
    work++
    minMultis[work] = 1.4
    maxMultis[work] = 2.0
    work++
    minMultis[work] = 0.9
    maxMultis[work] = 1.4
    work++
    
    // Random low (Rate between 0.4 and 0.9)
    for (; work < 14; work++) {
      minMultis[work] = 0.4
      maxMultis[work] = 0.9
    }
    mins.push(minMultis)
    maxs.push(maxMultis)
  }
  console.log("Pattern 1 min ultipliers", mins)
  console.log("Pattern 1 max ultipliers", maxs)
  return {
    mins: mins,
    maxs: maxs
  }
}

const getPattern2Multipliers = () => {
  // PATTERN 2: consistently decreasing
  const minMultis = getEmptyPriceList()
  const maxMultis = getEmptyPriceList()

  let rateMaxVal = .9
  let rateMinVal = .85

  for (let work = 2; work < 14; work++) {
    maxMultis[work] = rateMaxVal
    minMultis[work] = rateMinVal

    rateMaxVal -= .03
    rateMinVal -= .05
  }
  return {
    mins: [minMultis],
    maxs: [maxMultis]
  }
}

const getPattern3Multipliers = () => { 
  // PATTERN 3: decreasing, spike, decreasing
  const maxs = []
  const mins = []

  for (let peakStart = 2; peakStart <= 9; peakStart++) {
    let work = 0
    const minMultis = getEmptyPriceList()
    const maxMultis = getEmptyPriceList()
    
    let rateMinVal = .9
    let rateMaxVal = .4

    // decreasing phase before the peak
    for (work = 2; work < peakStart; work++) {
      minMultis[work] = rateMaxVal
      maxMultis[work] = rateMinVal

      rateMinVal -= .03
      rateMaxVal -= .05
    }

    // Peak, 5 price updates long
    minMultis[work] = 0.9
    maxMultis[work] = 1.4
    work++
    minMultis[work] = 0.9
    maxMultis[work] = 1.4
    work++
    
    rateMinVal = 1.4; rateMaxVal = 2.0;

    minMultis[work] = 1.4
    maxMultis[work] = 2.0
    work++
    // Note: 4th updated price in peak should have the best price!
    minMultis[work] = 1.4
    maxMultis[work] = 2.0
    work++
    minMultis[work] = 1.4
    maxMultis[work] = 2.0
    work++

    // decreasing phase after the peak
    rateMinVal = .4
    rateMaxVal = .9
    for (; work < 14; work++) {
      maxMultis[work] = rateMaxVal
      minMultis[work] = rateMinVal
    
      rateMaxVal -= .03
      rateMinVal -= .05
    }
    mins.push(minMultis)
    maxs.push(maxMultis)
  }
  return {
    mins: mins,
    maxs: maxs
  }
}

export const getPatterns = (): IPatternContainer => {
  return {
    pattern0: getPattern0Multipliers(),
    pattern1: getPattern1Multipliers(),
    pattern2: getPattern2Multipliers(),
    pattern3: getPattern3Multipliers(),
   }
}
