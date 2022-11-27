import { Button, ButtonGroup, FormControl, Input, FormLabel, Flex, Box } from '@chakra-ui/react'
import { useState } from 'react'
// import { generateProof } from "@semaphore-protocol/proof"
import { Identity } from "@semaphore-protocol/identity"
import { useAccount, useConnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

function Home() {
    // we just need identity onboarding, and a button to signal, which generates proof
    // how does semaphore have unique nullifiers

    // address to identity
    const [users, setUsers] = useState({});
    const [target, setTarget] = useState("");
    const [value, setValue] = useState(0);
    const [data, setData] = useState("");
    const [operation, setOperation] = useState("");
    const [queue, setQueue] = useState([]); // an array of dictionaries, ordered by when the transaction was voted on
    // {nonce, formInfo {to, value, data, operation}, roots [], nullifierHashes [], proofs [], voters [], }

    const { address, isConnected } = useAccount()
    const { connect } = useConnect({
      connector: new InjectedConnector(),
    })

    function createIdentity() {
      // address from address 
      if (isConnected) {
        console.log("isConnected")
        // get the user to generate a deterministic identity
        // const { trapdoor, nullifier, commitment } = new Identity(address);
        // setUsers([...users , {"trapdoor": trapdoor, "nullifier": nullifier, "commitment": commitment}]);
        
      } else {
        console.log("not connected to web3")
      }


      // add to group

    }

    // called when you submit form
    async function initTxn(formInfo) {
      //   address to, // this is the target address, eg if you want the txn to push a button, this is the button
      // // for us, don't we want the target to be anything?
      // uint256 value,
      // bytes memory data,
      // Enum.Operation operation,

      // get prev nonce
      const prevNonce = queue[queue.length - 1]["nonce"];
      const nonce = prevNonce + 1;

      // get address, generate the identity
      // const { trapdoor, nullifier, commitment } = new Identity(address);

      // set form info - alr done

      // voters 
      // need to generate proof and nullifier hash and what not ... lol

      // uint256[] memory merkleTreeRoots,
      // uint256[] memory nullifierHashes,
      // uint256[8][] memory proofs,
      // bytes32[] memory votes

      const newVoters = [];
      // get merkletree root from smart contract ?
      //const merkleTreeRoot = 
      // const externalNullifier = group.root
      const signal = "proposal_1"

      // const fullProof = await generateProof(identity, group, externalNullifier, signal, {
      //   zkeyFilePath: "./semaphore.zkey",
      //   wasmFilePath: "./semaphore.wasm"
      // })
      // newVoters += [{
      //   "proof"
      // }];
      


    }

     // display identities console.log(identity.toString())

    // reuse identities
    // const identity2 = new Identity(identity.toString())

    return (
      <Box>
        <Box display='flex' flexDirection='column' alignItems='flex-start'>
        {
          (isConnected) ?  
          <div>Connected to {address} </div>
          :  
          <Button onClick = {connect}>
            Connect Wallet
          </Button>
        }
        <Button
          onClick={createIdentity}
        >
          Create Identity
        </Button>

        </Box>

        <FormControl>
          <FormLabel>Target contract address</FormLabel>
          <Input type='string' />
          <FormLabel>Value</FormLabel>
          <Input type='number' />
          <FormLabel>Data</FormLabel>
          <Input type='string' />
          <FormLabel>Operation</FormLabel>
          <Input type='string' />
          <Button
            onClick={initTxn}
          >
            Init Transaction
        </Button>
        </FormControl>
      </Box>

    );
  }
  
  export default Home;
