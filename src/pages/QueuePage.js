import {
  Button,
  Box,
  VStack,
  HStack,
  GridItem,
} from "@chakra-ui/react";
import {
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { useAtom } from "jotai";
import { queueAtom, nonceAtom, groupAtom, groupIdAtom } from "../utils/atoms.js";

import { useState } from "react";

import { packToSolidityProof, generateProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";
import { ethers, utils } from "ethers";
import { encodeSingle, TransactionType } from "ethers-multisend"

import privateModule from "../utils/PrivateModule.js";

function QueuePage() {
  const [queue, setQueue] = useAtom(queueAtom);
  const [nonce, setNonce] = useAtom(nonceAtom);
  const [group, setGroup] = useAtom(groupAtom);
  const [groupId, setGroupId] = useAtom(groupIdAtom);
  const [calldata, setCalldata] = useState("");

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  // TODO: cleaner way of using this code?
  const moduleContract = useContract({
    address: "0x61842C85d11a87df0D037d8Ee8BDA4469e5c1CDE",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  async function signTxn(txn, txnIndex) {
    // get address, re-generate the identity
    const identity = new Identity(address);

    const vote = ethers.utils.formatBytes32String(nonce);

    // const groupId = 13;

    // TODO: store this in react state or db?
    // i think react state, have the user enter in safe address
    // or have a "your safes" in db, for now just store in state
    // const group = await semaphoreContract.groups(groupId);
    // console.log(group);

    // group.root is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, group, groupId, vote);
    console.log(fullProof);

    // initialized merkleTreeRoots
    const treeRoots = [...txn.roots, fullProof.publicSignals.merkleRoot];

    // initialized nullifier hahshes
    const nulHashes = [
      ...txn.nullifierHashes,
      fullProof.publicSignals.nullifierHash,
    ];

    // initialized proofs
    const solidityProof = packToSolidityProof(fullProof.proof);
    const proofs = [...txn.proofs, solidityProof];

    // initialized voters array
    const votes = [...txn.voters, vote];

    const newTxn = {
      ...txn,
      roots: treeRoots,
      nullifierHashes: nulHashes,
      proofs: proofs,
      voters: votes,
    };

    queue[txnIndex] = newTxn;
    setQueue(queue);
  }

  // this function just has to fix inputs, and call the execute transaction function
  async function executeTransaction(txn, txnIndex) {

    /*
    params 

    address to, 
    uint256 value,
    bytes memory data,
    Enum.Operation operation,

    uint256[] memory merkleTreeRoots,
    uint256[] memory nullifierHashes,
    uint256[8][] memory proofs,
    bytes32[] memory votes
    */

    // address val in solidity, string val in js
    const to = txn.formInfo.target

    // wei u256 value in solidity, int in js
    // TODO: users must pass in wei - if not eth transfer ??? 
    // const value = ethers.BigNumber.from(txn.formInfo.value)

    // const value = utils.formatEther(txn.formInfo.value)
    const value = txn.formInfo.value
    console.log(value)

    // right now, we are just supporting simple eth transfers and calls without args
    // otherwise, we would have to look through funcCall

    const a = txn.formInfo.args

    const type = txn.formInfo.type 
    if (type == "ERC20") {
        const metaTxn = encodeSingle({
            type: TransactionType.transferFunds,
            id: "0", // not relevant for encoding the final transaction
            // token: txn.target | null, // ERC20 token contract address, `null` or empty string for ETH
            token: to,
            to: a[0], // address of recipient
            // TODO: for ERC20 transfers, do they have an ETH value associated with them?
            amount: value, // string representation of the value formatted with the token's decimal digits, e.g., "1.0" for 1 ETH
            decimals: txn.formInfo.decimals // decimal places of the token
        })
        const currCalldata = metaTxn.data
        setCalldata(currCalldata)

    } else if (type == "ERC721") {

    } else if (type == "contract") {

    } else if (type == "ETH") {
        const metaTxn = encodeSingle({
            type: TransactionType.transferFunds,
            id: "0", // not relevant for encoding the final transaction
            // token: txn.target | null, // ERC20 token contract address, `null` or empty string for ETH
            token: null,
            to: to, // address of recipient
            amount: "1.0", // string representation of the value formatted with the token's decimal digits, e.g., "1.0" for 1 ETH
            decimals: 18 // decimal places of the token
        })

        const operation = 0;
        // if (txn.formInfo.operation == "delegatecall") {
        //     operation = 1;
        // }
        const currCalldata = metaTxn.data
        setCalldata(currCalldata)
        console.log(to)
        console.log(metaTxn.value)
        console.log(currCalldata)
        console.log(operation)
        console.log(txn.roots)
        console.log(txn.nullifierHashes)
        console.log(txn.proofs)
        console.log(txn.voters)

        const execTxn = await moduleContract.executeTransaction(
            to,
            metaTxn.value,
            // "1.0",
            currCalldata,
            operation,
            txn.roots,
            txn.nullifierHashes,
            txn.proofs,
            txn.voters,
            {gasLimit: 350000}
        );

        console.log(execTxn);
    } else {
        console.log(type)
        console.log("wrong type")
    }
    const funcCall = txn.formInfo.data

    const args = txn.formInfo.args
    // args[2] = utils.BigNumber.from(args[2])
    // args[2] = utils.formatEther(args[2])

    // const abiCoder = utils.defaultAbiCoder
    // const encodedData = iface.encodeFunctionData(funcCall, encodedData)
    // TODO: better way of dealing with this
    // 0 is call, 1 is delegatecall
  }

  function getTransactionData(e, i) {
    /*
        nonce -
        address to - 
        calldata (function and args) - 
        eth value 
        operation

        num signatures - 
        button to sign -
        button to execute - 
        */
    return (
      <VStack
        p={4}
        spacing="10px"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        borderRadius="10px"
        borderWidth="1px"
        borderColor="grey"
        borderStyle="solid"
      >
        <HStack spacing="10px" borderStyle="solid" borderColor="grey">
          <Box>{e.nonce}</Box>
          <Box>{e.formInfo.target}</Box>
          <Box>{e.formInfo.data}</Box>
          <Box>{e.voters.length} signers</Box>
        </HStack>
        <HStack spacing="10px" borderStyle="solid" borderColor="grey">
          <Box>{e.formInfo.operation}</Box>
          <Box>{e.formInfo.value}</Box>
        </HStack>
        <HStack spacing="10px">
          <Button onClick={() => signTxn(e, i)}>Sign</Button>
          <Button onClick={() => executeTransaction(e, i)}>Execute</Button>
        </HStack>
      </VStack>
    );
  }

  return <Box p={6}>{queue.map(getTransactionData)}</Box>;
}

export default QueuePage;
