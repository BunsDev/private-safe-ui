import logo from './logo.svg';
import './App.css';
import { ChakraProvider } from '@chakra-ui/react'
import * as React from 'react'
import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultProvider } from 'ethers'
import { Home } from './pages/Home.js'
 
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

function App() {
  // we just need identity onboarding, and a button to signal, which generates proof

  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <div className="App">
          hi
        </div>

      </ChakraProvider>
    </WagmiConfig>
  );
}

export default App;
