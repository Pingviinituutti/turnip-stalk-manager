import * as React from "react"

interface ContentProps {
  title: string
}

export const Content: React.FC<ContentProps> = (props) => {
  return (
    <div className={'text-content-container'}>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  )
}