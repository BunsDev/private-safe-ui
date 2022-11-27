import {
  Button,
  ButtonGroup,
  FormControl,
  Input,
  FormLabel,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
// import { generateProof } from "@semaphore-protocol/proof"
import { Identity } from "@semaphore-protocol/identity";
import {
  chain,
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
  configureChains,
  createClient,
  defaultChains,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { ethers } from "ethers";

import privateModule from "../utils/PrivateModule.js";

function Home() {
  // we just need identity onboarding, and a button to signal, which generates proof
  // how does semaphore have unique nullifiers

  // address to identity
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState("");
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState("");
  const [operation, setOperation] = useState("");
  const [queue, setQueue] = useState([]); // an array of dictionaries, ordered by when the transaction was voted on
  // {nonce, formInfo {to, value, data, operation}, roots [], nullifierHashes [], proofs [], voters [], }

  // TODO: fix issues with network change
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  // console.log(chain)
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    //{
    // chains: [chain.goerli],
    // options: {
    //   shimChainChangedDisconnect: true,
    // }
    //}
  });

  const { data: signer, isError, isLoading } = useSigner();

  const moduleContract = useContract({
    address: "0xCb044fdcdbE8F20CEF7Fa89B4d05A522af278a40",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  // const { joinFunction } = usePrepareContractWrite({
  //   address: '0xCb044fdcdbE8F20CEF7Fa89B4d05A522af278a40',
  //   abi: privateModule["abi"],
  //   functionName: 'joinAsSigner',
  //   args: [787878787, "jsdkfjskdj"],
  // })

  // const { joinData, isLoading, isSuccess, joinAsSigner } = useContractWrite(joinFunction)

  async function createIdentity() {
    // address from address
    console.log(users);
    if (isConnected) {
      console.log("isConnected");
      // get the user to generate a deterministic identity
      const { trapdoor, nullifier, commitment } = new Identity(address);
      setUsers((old) => [
        ...old,
        { trapdoor: trapdoor, nullifier: nullifier, commitment: commitment },
      ]);

      // add to group
      console.log(moduleContract);
      // console.log(moduleContract.isIndexed())

      const signedId = signer.signMessage(commitment) 
      const b32user = ethers.utils.formatBytes32String(signedId);

      // TODO: do the ecdsa sig

      const addSigner = await moduleContract.joinAsSigner(
        commitment,
        // 0xABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234
        b32user
      );

      console.log(addSigner)
      // joinAsSigner?.(commitment, address);
      // if (isSuccess) {
      //   console.log(JSON.stringify(joinData))
      // }
    } else {
      console.log("not connected to web3");
    }
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
    const { trapdoor, nullifier, commitment } = new Identity(address);

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
    const signal = "proposal_1";

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
  console.log("post");
  console.log(users);
  return (
    <Box>
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        {isConnected ? (
          <div>
            <div>Connected to {address} </div>
            <Button onClick={disconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button onClick={connect}>Connect Wallet</Button>
        )}
        <Button onClick={createIdentity}>Create Identity</Button>
      </Box>

      <FormControl>
        <FormLabel>Target contract address</FormLabel>
        <Input type="string"/>
        <FormLabel>Value</FormLabel>
        <Input type="number" />
        <FormLabel>Data</FormLabel>
        <Input type="string" />
        <FormLabel>Operation</FormLabel>
        <Input type="string" />
        <Button onClick={initTxn}>Init Transaction</Button>
      </FormControl>
    </Box>
  );
}

export default Home;
