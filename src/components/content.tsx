import * as React from "react"

interface TextContentProps {
  title: string
  children: React.ReactNode
}

export const Content = (props: TextContentProps) => {
  return (
    <div className={'text-content-container'}>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  )
}

export default Content