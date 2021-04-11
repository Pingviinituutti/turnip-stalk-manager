import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { TurnipPriceManager } from "../components/turnip-manager"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Test</h1>
    <TurnipPriceManager />
  </Layout>
)

export default IndexPage
