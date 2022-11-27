import logo from './logo.svg';
import './App.css';
import Home from './pages/Home.js'

import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultProvider } from 'ethers'
import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

function App() {
  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <div>hi</div>
        <Home />
      </ChakraProvider>
    </WagmiConfig>
  );
}

export default App;
