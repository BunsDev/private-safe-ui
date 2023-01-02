import { Flex, Box, defineStyle, defineStyleConfig, Heading, Button } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";


const brandPrimary = defineStyle({
  color: "white",
  fontFamily: "monospace",
  fontWeight: "normal",
});

export const linkTheme = defineStyleConfig({
  variants: { brand: brandPrimary },
});

function NavBar() {

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  return (
    <Box border="1px" borderColor="#E0E0E0" bg="white">
      <Flex flexDirection="row" justifyContent="space-between">
      <Flex flexDirection="row" >
        <Box p={4} pl={10} height="50%">
        <Link variant="brand" to="/">
          <Heading size="md">Private Safe</Heading>
          </Link>
        </Box>
        <Box p={4}>
          <Link variant="brand" to="/transaction">
            Transaction
          </Link>
        </Box>
        <Box p={4} pr={7}>
          <Link to="/queue" variant="brand">
            Queue
          </Link>
        </Box>
      </Flex>
      <Flex justifyContent="flex-end" p={2} pl={10} pr={10} borderLeft="1px" borderColor="#E0E0E0">
        {
          !isConnected ? <Button color="black" size="md" variant="link" onClick={connect} bg="white">Connect Wallet</Button> :
          <Flex pt={1} pl={2} direction="column"><Heading size="xs">{address.slice(0, 6) + "..." + address.slice(address.length - 3, address.length)} </Heading>
          <Button color="black" size="xs" variant="link" onClick={disconnect} bg="white">Disconnect Wallet</Button>
          </Flex>
        }
      </Flex>
      </Flex>
    </Box>
  );
}

export default NavBar;
