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
import { ethers, utils } from "ethers";
import { encodeSingle, TransactionType } from "ethers-multisend"

import privateModule from "../utils/PrivateModule.js";
import semaphoreJson from "../sema/semaphore.json";
import api from "../helpers/api.js";

function QueuePage() {
  const [queue, setQueue] = useAtom(queueAtom);
  const [nonce, setNonce] = useAtom(nonceAtom);
  const [group, setGroup] = useAtom(groupAtom);
  const [groupId, setGroupId] = useAtom(groupIdAtom);
  const [transactions, setTransactions] = useState([])
  const [calldata, setCalldata] = useState("");

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  console.log(transactions)

  // TODO: cleaner way of using this code?
  const moduleContract = useContract({
    address: "0x3818aC507F4a9eCC288569d17DC22911f95F2da0",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  useEffect(() => {
    refreshSafeTransactions();
  }, []);

  // refetch the transactions in the safe for display, use in a useEffect call
  const refreshSafeTransactions = () => {
    api
      .get("/")
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

  async function signTxn(txn, txnIndex) {
    // get address, re-generate the identity
    const identity = new Identity(address);

    const vote = ethers.utils.formatBytes32String(nonce);

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

    // address val in solidity, string val in js
    const to = txn.form.target

    // wei u256 value in solidity, int in js
    // TODO: users must pass in wei - if not eth transfer ??? 
    // const value = ethers.BigNumber.from(txn.form.value)

    // const value = utils.formatEther(txn.form.value)
    const value = txn.form.value
    console.log(value)

    const a = txn.form.args

    const type = txn.form.type 
    console.log('printing queuepage txn type')
    console.log(type)

    if (type == "ERC20") {
        // have user pass in info about erc20 token decimals + recipient
        const metaTxn = encodeSingle({
            type: TransactionType.transferFunds,
            id: "0", // not relevant for encoding the final transaction
            // token: txn.target | null, // ERC20 token contract address, `null` or empty string for ETH
            token: to,
            to: a[0], // address of recipient
            // TODO: for ERC20 transfers, do they have an ETH value associated with them?
            amount: value, // string representation of the value formatted with the token's decimal digits, e.g., "1.0" for 1 ETH
            decimals: txn.form.decimals // decimal places of the token
        })
        const currCalldata = metaTxn.data
        setCalldata(currCalldata)

    } else if (type == "ERC721") {
        // have user pass in recipient + tokenId
        const metaTxn = encodeSingle({
            type: TransactionType.transferCollectible,
            id: "0", // not relevant for encoding the final transaction
            address: to, // ERC721 contract address
            tokenId: string, // ID of the NFT
            to: string, // address of recipient
            // TODO: not sure about this address ,\.... safe
            from: address // address of sender
        })

    } else if (type == "contract") {
        // TODO: take in ABI as input
        const metaTxn = encodeSingle({
          type: TransactionType.callContract,
          id: "0", // not relevant for encoding the final transaction
          to: to, // contract address
          value: value, // amount of wei to send
          abi: string, // ABI as JSON string
          functionSignature: string,
          // inputValues: { [key: string]: ValueType }
      })
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
        // if (txn.form.operation == "delegatecall") {
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
            txn.nullifierHashes,
            txn.proofs,
            txn.voters,
            {gasLimit: 2000000}
        );

        console.log(execTxn);
    } else {
        console.log(type)
        console.log("wrong type")
    }
    const funcCall = txn.form.data

    const args = txn.form.args
    // args[2] = utils.BigNumber.from(args[2])
    // args[2] = utils.formatEther(args[2])

    // const abiCoder = utils.defaultAbiCoder
    // const encodedData = iface.encodeFunctionData(funcCall, encodedData)
    // TODO: better way of dealing with this
    // 0 is call, 1 is delegatecall
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
          <Box>{e.form.target}</Box>
          <Box>{e.form.data}</Box>
          <Box>{e.voters.length} signers</Box>
        </HStack>
        <HStack spacing="10px" borderStyle="solid" borderColor="grey">
          <Box>{e.form.operation}</Box>
          <Box>{e.form.value}</Box>
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
