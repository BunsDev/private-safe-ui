import logo from "./logo.svg";
import "./App.css";
import Home from "./pages/Home.js";
import QueuePage from "./pages/QueuePage.js";
import NavBar from "./components/NavBar.js";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import {
  WagmiConfig,
  createClient,
  configureChains,
  createClient,
  defaultChains,
  chain,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getDefaultProvider } from "ethers";
import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import { Flex, Box } from "@chakra-ui/react";

const { chains, provider } = configureChains(
  [chain.goerli],
  [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY })]
);

const client = createClient({
  connectors: [new InjectedConnector({ chains })],
  provider,
});

function App() {
  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <Router>
          <Box p={10}>
          <NavBar />
          <Routes>
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/" element={<Home />} />
          </Routes>
          </Box>
        </Router>
      </ChakraProvider>
    </WagmiConfig>
  );
}

export default App;
