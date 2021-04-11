import { createContext, useContext } from "react";
import { TurnipPriceStore } from "./TurnipPriceStore";

export const rootStoreContext = createContext({
  turnipPriceStore: new TurnipPriceStore()
});

export const useStores = () => useContext(rootStoreContext);
