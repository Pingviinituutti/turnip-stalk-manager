import * as React from "react"
// import { Link } from "gatsby"
// import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { TurnipCalendar, TurnipPriceManager } from "../components/turnipManager"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <TurnipCalendar />
    <TurnipPriceManager />
  </Layout>
)

export default IndexPage
