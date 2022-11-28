import {
  Button,
  ButtonGroup,
  FormControl,
  Input,
  FormLabel,
  Flex,
  Box,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { Identity } from "@semaphore-protocol/identity";
const { Group } = require("@semaphore-protocol/group")
import { packToSolidityProof, generateProof } from "@semaphore-protocol/proof";
import {
  chain,
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ethers } from "ethers";

import privateModule from "../utils/PrivateModule.js";
import semaphore from "../utils/Semaphore.js";

function Home() {
  // we just need identity onboarding, and a button to signal, which generates proof
  // how does semaphore have unique nullifiers

  const wasmFilePath = "../sema/semaphore.wasm";
  const zkeyFilePath = "../sema/semaphore.zkey";

  // address to identity
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState("");
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState("");
  const [operation, setOperation] = useState("");
  const [queue, setQueue] = useState([]); // an array of dictionaries, ordered by when the transaction was added
  const [nonce, setNonce] = useState(0);
  const [currRoot, setCurrRoot] = useState(-1)
  // {nonce, formInfo {to, value, data, operation}, roots [], nullifierHashes [], proofs [], voters [], }

  // TODO: fix issues with network change
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  // console.log(chain)
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { data: signer, isError, isLoading } = useSigner();

  const moduleContract = useContract({
    address: "0xCb044fdcdbE8F20CEF7Fa89B4d05A522af278a40",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  const semaphoreContract = useContract({
    address: "0x5259d32659F1806ccAfcE593ED5a89eBAb85262f",
    abi: semaphore,
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

      const signedId = signer.signMessage(commitment);
      const b32user = ethers.utils.formatBytes32String(signedId);

      const addSigner = await moduleContract.joinAsSigner(
        commitment,
        // 0xABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234
        b32user
      );

      console.log(addSigner);

      const updateRoot = await semaphoreContract.on("MemberAdded", (groupId, index, identityCommitment, root) => {
        console.log("updating root")
        console.log(root)
        setCurrRoot(root)
      })

      console.log(updateRoot)

      // joinAsSigner?.(commitment, address);
      // if (isSuccess) {
      //   console.log(JSON.stringify(joinData))
      // }
    } else {
      console.log("not connected to web3");
    }
  }

  // called when you submit form
  async function initTxn() {
    //   address to, // this is the target address, eg if you want the txn to push a button, this is the button
    // // for us, don't we want the target to be anything?
    // uint256 value,
    // bytes memory data,
    // Enum.Operation operation,

    // get prev nonce from the last element of queue
    
    // const prevNonce = queue[queue.length - 1]["nonce"];
    // const nonce = prevNonce + 1;

    // get address, re-generate the identity
    const identity = new Identity(address);

    // uint256[] memory merkleTreeRoots,
    // uint256[] memory nullifierHashes,
    // uint256[8][] memory proofs,
    // bytes32[] memory votes

    // TODO: make vote specific to the txn, maybe w nonce, verify onchain
    const vote = ethers.utils.formatBytes32String(nonce);

    // TODO: get groupID from contract later
    // const groupId = await moduleContract.groupId();
    const groupId = 13;

    // don't think i need to use this then
    console.log("semaphore contract")
    console.log(semaphoreContract)
    const group = await semaphoreContract.groups(groupId);
    console.log(group);

    // TODO: make sure you retrieve initial root!
    if (currRoot == -1) {
      console.log("error, cannot make calls with empty group, wait longer or add a mem")
    }

    const offchainGroup = new Group()
    const members = await moduleContract.queryFilter(moduleContract.filters.NewUser())
    console.log(members)
    offchainGroup.addMembers(members.map((e) => e.args[0].toString()))

    // TODO: not sure if we just get the group object returned to us
    // currRoot is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, offchainGroup, currRoot, vote 
    //   {
    //   wasmFilePath,
    //   zkeyFilePath,
    // }
    );

    console.log(fullProof)

    // initialized merkleTreeRoots
    const treeRoots = [fullProof.publicSignals.merkleRoot];

    // initialized nullifier hahshes
    const nulHashes = [fullProof.publicSignals.nullifierHash];

    // initialized proofs
    const solidityProof = packToSolidityProof(fullProof.proof);
    const proofs = [solidityProof];

    // initialized voters array
    const votes = [vote];

    const txn = {
      nonce: nonce,
      formInfo: {
        target: target,
        value: value,
        data: formData,
        operation: operation,
      },
      roots: treeRoots,
      nullifierHahes: nulHashes,
      proofs: proofs,
      voters: votes,
    };

    setQueue([...queue, txn]);
  }

  async function signTxn(txnIndex) {

    // get address, re-generate the identity
    const identity = new Identity(address);
    
    const vote = ethers.utils.formatBytes32String(to + data);

    const groupId = 13;

    const group = await semaphoreContract.groups(groupId);
    console.log(group);

    // group.root is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, group.root, groupId, vote, {
      wasmFilePath,
      zkeyFilePath,
    });

    const currTxn = queue[txnIndex]

    // initialized merkleTreeRoots
    const treeRoots = [...currTxn.roots, nullProof.publicSignals.merkleRoot];

    // initialized nullifier hahshes
    const nulHashes = [...currTxn.nullifierHashes, fullProof.publicSignals.nullifierHash];

    // initialized proofs
    const solidityProof = packToSolidityProof(fullProof.proof);
    const proofs = [...currTxn.proofs, solidityProof];

    // initialized voters array
    const votes = [...currTxn.votes, vote];

    const txn = {
      nonce: currTxn.nonce,
      formInfo: {
        target: currTxn.formInfo.target,
        value: currTxn.formInfo.value,
        data: currTxn.formInfo.formData,
        operation: currTxn.formInfo.operation,
      },
      roots: treeRoots,
      nullifierHahes: nulHashes,
      proofs: proofs,
      voters: votes,
    };

    queue[txnIndex] = txn
    setQueue(queue);
  }

  console.log("queue")
  console.log(queue)

  return (
    <Box p={4}>
      <VStack pb={4} spacing="10px" display="flex" flexDirection="column" alignItems="flex-start">
        {isConnected ? (
          <Box>
            <Box>Connected to {address} </Box>
            <Button onClick={disconnect}>Disconnect</Button>
          </Box>
        ) : (
          <Button p={4} onClick={connect}>Connect Wallet</Button>
        )}
        <Button p={4} onClick={createIdentity}>Create Identity</Button>
      </VStack>

      <FormControl>
        <VStack spacing="10px" alignItems="flex-start">
        <FormLabel>Target contract address</FormLabel>
        <Input
          type="string"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
        <FormLabel>Value</FormLabel>
        <Input
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <FormLabel>Data</FormLabel>
        <Input
          type="string"
          value={formData}
          onChange={(event) => setFormData(event.target.value)}
        />
        <FormLabel>Operation</FormLabel>
        <Input
          type="string"
          value={operation}
          onChange={(event) => setOperation(event.target.value)}
        />
        <Button onClick={initTxn}>Init Transaction</Button>
        </VStack>
      </FormControl>

      <Box>
        {
          queue.map((e) => {
            <Box>

            </Box>
          })
        }
      </Box>
    </Box>
  );
}

export default Home;
