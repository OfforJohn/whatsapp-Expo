import { createContext, useContext, useReducer } from "react";
import reducer, { initialState } from "./StateReducers";

export const StateContext = createContext();




export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);


console.log("ddd",initialState)
console.log("ss",reducer)

export const useStateProvider = () => useContext(StateContext);
