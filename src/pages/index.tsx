import * as React from "react"
// import { Link } from "gatsby"
// import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { TurnipCalendar, TurnipJSONArea, TurnipShareLink } from "../components/turnipManager"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <TurnipCalendar />
    <TurnipShareLink />
    <TurnipJSONArea />
  </Layout>
)

export default IndexPage
