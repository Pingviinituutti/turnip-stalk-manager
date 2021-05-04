export type Time = 'morning' | 'afternoon'

export interface ITurnip {
  day: string
  time: Time
  price?: number
}

export type TPatterns = 'pattern0' | 'pattern1' | 'pattern2' | 'pattern3'
export type TPrice = (number | '')

export type TWeekPrices = (TPrice)[]

export interface IPatternMinMax {
  mins: TWeekPrices[]
  maxs: TWeekPrices[]
}

export interface IPatternContainer {
  pattern0?: IPatternMinMax // PATTERN 0: high, decreasing, high, decreasing, high
  pattern1?: IPatternMinMax // PATTERN 1: decreasing middle, high spike, random low
  pattern2?: IPatternMinMax // PATTERN 2: consistently decreasing
  pattern3?: IPatternMinMax // PATTERN 3: decreasing, spike, decreasing
}

export interface IPattern {
  pattern0?: number // PATTERN 0: high, decreasing, high, decreasing, high
  pattern1?: number // PATTERN 1: decreasing middle, high spike, random low
  pattern2?: number // PATTERN 2: consistently decreasing
  pattern3?: number // PATTERN 3: decreasing, spike, decreasing
  // [key: string]: number
}

export interface IPredictionProps {
  probability?: number,
  possiblePatterns?: IPatternMinMax
}

export interface IPredictions {
  pattern0?: IPredictionProps
  pattern1?: IPredictionProps
  pattern2?: IPredictionProps
  pattern3?: IPredictionProps
}
export type TPredictions = IPredictions & {
  [key in TPatterns]: IPredictionProps
}

export interface IPredictionsObj {
  [key: string]: {
    prices: TWeekPrices
    pattern0?: IPredictionProps
    pattern1?: IPredictionProps
    pattern2?: IPredictionProps
    pattern3?: IPredictionProps
  }
}
