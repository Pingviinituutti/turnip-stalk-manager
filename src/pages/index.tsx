import * as React from "react"
import { ToastContainer } from "react-toastify"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { TurnipCalendar, TurnipJSONArea, TurnipShareLink } from "../components/turnipManager"
import { Content } from "../components/content"

const IndexPage = () => (
  <Layout>
    <SEO title="Turnip Stalk Manager" />
    <Content title={'Welcome!'}>
      <p>
        Use this app to track your turnip prices and help you decide whether the odds are with you for the next week.
        Click on a calendar tile's prices to edit that day's prices.
      </p>
      <p>
        All data is stored locally in your browser, so don't clear your cache if you want to keep your turnip prices saved somewhere.
        To save turnips or share your prices with someone, click the "Share link" button below the calendar.
        This link contains all your turnips as a data string in the url.
      </p>
      <p>
        More information about abbreviations and how the Stalk Manager works is described below the price calendar.
      </p>
    </Content>

    <TurnipCalendar />
    <TurnipShareLink />
    <TurnipJSONArea />

    <Content title={"Usage instructions"}>
      <p>
        The Stalk Manager works like a calendar.
        You fill in the turnip buy price for Sundays (the first column with red text), and the morning and after noon sell prices for the other days.
        With these prices, the Stalk Manager can recognize the current weeks pattern, and when there are fewer than four alternatives, it can also give the probabilities of each pattern for the next week.
      </p>
      <p>
        There are four different patterns, as explained on pages such as <a href="https://animalcrossing.fandom.com/wiki/White_turnip#Buying_and_selling_in_New_Horizons">Fandom's AC:NH turnip page</a>.
        The possible patterns and their abbreviations are:
      </p>
      <ul>
        <li>Fluctuating/random pattern – abbreviated as "Fluct."</li>
        <li>Large spike – abbreviated as "L Spike"</li>
        <li>Decreasing pattern – abbreviated as "Decr."</li>
        <li>Small spike – abbreviated as "S Spike".</li>
      </ul>
      <p>
        This Turnip Stalk Manager app is useful to logging your turnip price history.
        But if you want to check out the possible minimum and maximum prices during a week, take a look at the fantastic <a href="https://turnipprophet.io">Turnip Prohet</a> site made by Mike Bryant.
      </p>
    </Content>
    <Content title={"Credits"}>
      <p>
        This site was inspired by finding a way to outplay the turnip stalk market, which would not have been possible without <a href="https://twitter.com/_Ninji/status/1244818665851289602?s=20">Ninji's dissassembling work of ACNH's source code</a>.
      </p>
      <h3>Source code and contributing</h3>
      <p>
        The source code of this site can be found on <a href="https://github.com/Pingviinituutti/turnip-stalk-manager">GitHub</a>.
        There you can also file your issues and pull requests.
      </p>
    </Content>
    <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        limit={1}
      />
  </Layout>
)

export default IndexPage
