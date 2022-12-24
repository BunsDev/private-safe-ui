import {
  Button,
  Box,
  VStack,
  HStack,
} from "@chakra-ui/react";
import {
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { useAtom } from "jotai";
import { queueAtom, nonceAtom, groupAtom, groupIdAtom } from "../utils/atoms.js";

import { useState, useEffect } from "react";

import { packToSolidityProof, generateProof, verifyProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";
const { Group } = require("@semaphore-protocol/group");
import { ethers, utils } from "ethers";
import { encodeSingle, TransactionType } from "ethers-multisend"

import privateModule from "../utils/PrivateModule.js";
import semaphoreJson from "../sema/semaphore.json";
import api from "../helpers/api.js";
import { onUpdate, onDelete } from "../helpers/database.js"

function QueuePage() {
  const [queue, setQueue] = useAtom(queueAtom);
  const [nonce, setNonce] = useAtom(nonceAtom);
  const [group, setGroup] = useAtom(groupAtom);
  const [transactions, setTransactions] = useState([])
  const [calldata, setCalldata] = useState("");
  const [safes, setSafes] = useState([])
  const [currTxn, setCurrTxn] = useState({})

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  console.log(transactions)

  // TODO: cleaner way of using this code?
  const moduleContract = useContract({
    address: "0x5BDfc497B21D58656556703DeE95AAA475b6bA66",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  useEffect(() => {
    refreshSafeTransactions();
    // TODO: find a cleaner way to get safe
    refreshSafe();
  }, []);

  // refetch the transactions in the safe for display, use in a useEffect call
  const refreshSafeTransactions = () => {
    api
      .get("/transaction/")
      .then((res) => {
        console.log("got response");
        console.log(res.data)
        setTransactions(res.data)
        // here, return res.data is undefined even tho console.log works
        // return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const refreshSafe = () => {
    api
      .get("/safe/")
      .then((res) => {
        console.log("got response");
        console.log(res.data)
        // TODO: cleaner way of filtering for the safe
        setSafes(res.data)
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // TODO: get state to update without refresh
  async function signTxn(txn, txnIndex) {
    // get address, re-generate the identity
    setCurrTxn(txn);
    console.log(safes)
    const currSafe = safes.filter(e => e.safe == txn.safe)[0]
    const identity = new Identity(address);

    const vote = ethers.utils.formatBytes32String(txn.nonce);

    // get group, groupId, and filter by safe
    
    console.log(currSafe)
    
    // reconstruct group
    const reconstructedGroup = new Group();
    reconstructedGroup.addMembers(currSafe.group_members)

    console.log(reconstructedGroup)
    // console.log(groupId)
    // console.log(nonce)

    // group.root is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, reconstructedGroup, currSafe.group_id, vote);
    console.log(fullProof);

    // initialized merkleTreeRoots
    const treeRoots = [...txn.roots, fullProof.publicSignals.merkleRoot];

    // initialized nullifier hahshes
    const nulHashes = [
      ...txn.nullifier_hashes,
      fullProof.publicSignals.nullifierHash,
    ];

    // initialized proofs
    const solidityProof = packToSolidityProof(fullProof.proof);
    const proofs = [...txn.proofs, solidityProof];

    // initialized voters array
    const voters = [...txn.voters, vote];

    const newTxn = {
      ...txn,
      roots: treeRoots,
      nullifierHashes: nulHashes,
      proofs: proofs,
      voters: voters,
    };

    queue[txnIndex] = newTxn;
    setQueue(queue);

    // make a post request, updating the transaction in the database
    // id, roots, nulHashes, proofs, voters
    const pk = transactions[txnIndex].pk
    onUpdate(pk, treeRoots, nulHashes, proofs, voters);
  }

  // this function just has to fix inputs, and call the execute transaction function
  async function executeTransaction(txn, txnIndex) {

    // wei u256 value in solidity, int in js
    // TODO: users must pass in wei - if not eth transfer ??? 
    // const value = ethers.BigNumber.from(txn.form.value)

    // const value = utils.formatEther(txn.form.value)
    const value = txn.value
    console.log(value)

    const execTxn = await moduleContract.executeTransaction(
        //to,
        "0x3be0dDA9B3657B63c2cd9e836E41903c97518088",
        // metaTxn.value,
        0,
        // "1.0",
        // currCalldata,
        '0x',
        // operation,
        0,
        txn.roots,
        txn.nullifier_hashes,
        txn.proofs,
        txn.voters,
        {gasLimit: 2000000}
    );

    console.log(execTxn);

    // args[2] = utils.BigNumber.from(args[2])
    // args[2] = utils.formatEther(args[2])

    // const abiCoder = utils.defaultAbiCoder
    // const encodedData = iface.encodeFunctionData(funcCall, encodedData)
    // TODO: better way of dealing with this
    // 0 is call, 1 is delegatecall

    // delete the transaction from the db
    const pk = transactions[txnIndex].pk;
    const del = onDelete(pk);
    console.log(del)

  }

  function getTransactionData(e, i) {
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
          <Box>{e.target}</Box>
          <Box>{e.calldata}</Box>
          <Box>{e.voters.length} signers</Box>
        </HStack>
        <HStack spacing="10px" borderStyle="solid" borderColor="grey">
          <Box>{e.operation}</Box>
          <Box>{e.value}</Box>
        </HStack>
        <HStack spacing="10px">
          <Button onClick={() => signTxn(e, i)}>Sign</Button>
          <Button onClick={() => executeTransaction(e, i)}>Execute</Button>
        </HStack>
      </VStack>
    );
  }

  return <Box p={6}>{transactions.map(getTransactionData)}</Box>;
}

export default QueuePage;
