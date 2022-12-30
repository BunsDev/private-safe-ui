import { Button, Box, VStack, HStack } from "@chakra-ui/react";
import { useAccount, useContract, useSigner } from "wagmi";

import { useState, useEffect } from "react";

import { packToSolidityProof, generateProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";
const { Group } = require("@semaphore-protocol/group");
import { ethers } from "ethers";

import privateModule from "../utils/PrivateModule.js";
import api from "../helpers/api.js";
import { onUpdate, onDelete } from "../helpers/database.js";

function QueuePage() {
  const [transactions, setTransactions] = useState([]);
  const [safes, setSafes] = useState([]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  console.log(transactions);

  // TODO: cleaner way of using this code?
  const moduleContract = useContract({
    address: "0x917247784b3feF2602b4ca363C9BD6B87e722Afd",
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
        console.log(res.data);
        const ordered = res.data.sort((a, b) => a.pk - b.pk);
        setTransactions(ordered);
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
        console.log(res.data);
        // TODO: cleaner way of filtering for the safe
        setSafes(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // TODO: get state to update without refresh
  async function signTxn(txn, txnIndex) {
    // get address, re-generate the identity
    setCurrTxn(txn);
    console.log(safes);
    const currSafe = safes.filter((e) => e.safe == txn.safe)[0];
    const identity = new Identity(address);

    const vote = ethers.utils.hexZeroPad(ethers.utils.hexlify(txn.nonce), 32);
    console.log(currSafe);

    // reconstruct group
    const reconstructedGroup = new Group();
    reconstructedGroup.addMembers(currSafe.group_members);

    console.log(reconstructedGroup);

    // group.root is the external nullifier that corresponds to the group
    const fullProof = await generateProof(
      identity,
      reconstructedGroup,
      currSafe.group_id,
      vote
    );
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

    // make a post request, updating the transaction in the database
    const pk = transactions[txnIndex].pk;
    onUpdate(pk, treeRoots, nulHashes, proofs, voters);
  }

  // this function just has to fix inputs, and call the execute transaction function
  async function executeTransaction(txn, txnIndex) {
    console.log(txn);

    const execTxn = await moduleContract.executeTransaction(
      txn.target,
      txn.value,
      txn.calldata,
      txn.operation,
      txn.nonce,
      txn.roots,
      txn.nullifier_hashes,
      txn.proofs,
      txn.voters,
      { gasLimit: 2000000 }
    );

    console.log(execTxn);

    // delete the transaction from the db
    const pk = transactions[txnIndex].pk;
    const del = onDelete(pk);
    console.log(del);
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
