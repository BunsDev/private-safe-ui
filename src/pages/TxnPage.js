import {
  Button,
  FormControl,
  Input,
  FormLabel,
  Box,
  VStack,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  Text
} from "@chakra-ui/react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";
import { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
const { Group } = require("@semaphore-protocol/group");
import { packToSolidityProof, generateProof } from "@semaphore-protocol/proof";
import { InjectedConnector } from "wagmi/connectors/injected";
import privateModule from "../utils/PrivateModule.js";
import semaphore from "../utils/Semaphore.js";
import button from "../utils/Button.js";

import { getCalldata } from "../helpers/txnInputs";
import { onSubmit, onUpdateSafe } from "../helpers/database";
import api from "../helpers/api.js";
import { ethers } from "ethers";

function TxnPage() {
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("0");
  const [func, setFunc] = useState("");
  const [args, setArgs] = useState("");
  const [txnType, setTxnType] = useState("");
  const [decimals, setDecimals] = useState(0);
  const [contract, setContract] = useState("");
  const [safes, setSafes] = useState([]);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { data: signer } = useSigner();

  const moduleContract = useContract({
    address: "0x917247784b3feF2602b4ca363C9BD6B87e722Afd",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  const semaphoreContract = useContract({
    address: "0x98991E80649fe3751bba6CD9DA620de7Ac7E2eF2",
    abi: semaphore,
    signerOrProvider: signer,
  });

  const safe = "0xC3ACf93b1AAA0c65ffd484d768576F4ce106eB4f";

  useEffect(() => {
    const test = ethers.utils.parseEther("0.5");
    console.log(test);

    const test1 = ethers.utils.parseEther("1");
    console.log(test1);

    // TODO: find a cleaner way to get safe
    refreshSafe();
  }, []);

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

  async function createIdentity() {
    if (isConnected) {
      console.log("isConnected");

      // get safe
      // TODO: remove the hardcoded safe
      const curr = safes.filter((e) => e.safe == safe)[0];

      // get the user to generate a deterministic identity
      const { trapdoor, nullifier, commitment } = new Identity(address);
      console.log(commitment);

      // add to group
      console.log(moduleContract);
      const signedId = signer.signMessage(commitment);
      const b32user = ethers.utils.formatBytes32String(signedId);
      console.log(b32user);

      const addSigner = await moduleContract.joinAsSigner(commitment, b32user);

      console.log(addSigner);
      // update our merkle root
      const updateRoot = await semaphoreContract.on(
        "MemberAdded",
        (groupId, index, identityCommitment, root) => {
          console.log("updating root");
          console.log(root);
          setCurrRoot(root);
          // update db
          console.log(identityCommitment);
          const idNum = ethers.BigNumber.from(identityCommitment);
          const updatedMems = [...curr.group_members, idNum];
          onUpdateSafe(curr.pk, updatedMems);
        }
      );

      console.log(updateRoot);
    } else {
      console.log("not connected to web3");
    }
  }

  async function initTxn() {
    const prevGId = await moduleContract.groupId();
    const curr = safes.filter((e) => e.safe == safe)[0];

    // create a new group on chain
    const newGroup = await moduleContract.newGroup({ gasLimit: 4000000 });

    // get address, re-generate the identity
    const identity = new Identity(address);

    // get group, get members
    const gId = prevGId.toNumber();

    const offchainGroup = new Group();
    const members = await moduleContract.queryFilter(
      moduleContract.filters.NewUser()
    );
    console.log(members);
    const memberIds = members.map((e) => e.args[0].toString());
    offchainGroup.addMembers(memberIds);

    onUpdateSafe(curr.pk, memberIds);

    // create vote
    const vote = ethers.utils.hexZeroPad(ethers.utils.hexlify(gId), 32);

    // currRoot is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, offchainGroup, gId, vote);

    // initialized merkleTreeRoots
    const treeRoots = [fullProof.publicSignals.merkleRoot];

    // initialized nullifier hahshes
    const nulHashes = [fullProof.publicSignals.nullifierHash];

    // initialized proofs
    const solidityProof = packToSolidityProof(fullProof.proof);
    const proofs = [solidityProof];

    // initialized voters array
    const voters = [vote];

    const sepArgs = args.split(",");

    const txn = {
      safe: safe,
      nonce: gId,
      form: {
        target: target,
        value: value,
        data: null,
        args: sepArgs,
        operation: 0,
        type: txnType,
        decimals: decimals,
        // abi
        contract: contract,
        func: func,
      },
      roots: treeRoots,
      nullifierHashes: nulHashes,
      proofs: proofs,
      voters: voters,
    };

    // generate and update data field of txn
    const calldata = getCalldata(txn);
    txn["form"]["data"] = calldata.data;
    txn["form"]["value"] = calldata.value;

    console.log(txn);

    // make a post request, initializing the transaction in the database
    const submitToDb = onSubmit(txn);
    console.log(submitToDb);
  }

  function loadABI() {
    setContract(JSON.stringify(button["abi"]));
    setFunc("pushButton()");
    setTarget("0xBae98f264d9c78d372a2c615b0f7FCfE7A724653");
  }

  return (
    <Box p={6} pl={8} pr={8} bg="white" borderRadius={10} width="70%" border="1px" borderColor="#E0E0E0">
      {/* <VStack
        pb={4}
        spacing="10px"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
      >
        {isConnected ? (
          <Box>
            <Box>Connected to {address} </Box>
            <Button onClick={disconnect}>Disconnect</Button>
          </Box>
        ) : (
          <Button p={4} onClick={connect}>
            Connect Wallet
          </Button>
        )}
        <Button p={4} onClick={createIdentity}>
          Create Identity
        </Button>
      </VStack> */}

      <FormControl>
        <VStack spacing="10px" alignItems="flex-start">
          <RadioGroup onChange={setTxnType} value={txnType}>
            <Stack direction="row">
              <Radio value="ETH">ETH Transfer</Radio>
              <Radio value="ERC20">ERC20 Transfer</Radio>
              <Radio value="ERC721">ERC721 Transfer</Radio>
              <Radio value="contract">ContractCall</Radio>
            </Stack>
          </RadioGroup>
          {txnType == "ERC20" ? (
            <Box>
              <FormLabel>Decimals</FormLabel>
              <Input
                type="string"
                value={decimals}
                onChange={(event) => setDecimals(event.target.value)}
                placeholder="Recipient address (can be a contract address)"
              />
            </Box>
          ) : (
            <div>
              {txnType == "contract" ? (
                <Box>
                  <VStack spacing="7px" alignItems="flex-start">
                    <FormLabel>Function Selector</FormLabel>
                    <Input
                      type="string"
                      value={func}
                      onChange={(event) => setFunc(event.target.value)}
                    />
                    <FormLabel>ABI</FormLabel>
                    <Textarea
                      type="string"
                      value={contract}
                      onChange={(event) => setContract(event.target.value)}
                      placeholder="Contract ABI"
                    />
                    <Button onClick={loadABI}>Load Example</Button>
                  </VStack>
                </Box>
              ) : (
                <div>
                  {/* 
      type: TransactionType.transferCollectible,
      id: "0", // not relevant for encoding the final transaction
      address: to, // ERC721 contract address
      tokenId: a[2], // ID of the NFT
      to: a[1], // address of recipient
      from: a[0], // address of sender
       */}

                  {txnType == "ERC721" ? (
                    <Box>
                      {/* <FormLabel>ABI</FormLabel>
                  <Textarea
                    type="string"
                    value={contract}
                    onChange={(event) => setContract(event.target.value)}
                    placeholder="contract abi"
                  /> */}
                    </Box>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
            </div>
          )}
          <FormLabel>To</FormLabel>
          <Input
            type="string"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Recipient address (can be a contract address)"
          />
          <FormLabel>Value</FormLabel>
          <Input
            type="string"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ether value (e.g. 1.0)"
          />
          {
            txnType=="ERC20" ? 
            <Text mt={2}>Argument 1: Destination address</Text> :
            <Box>
              {
                txnType=="ERC721" ? 
                <VStack alignItems="flex-start" mt={2}>
                <Text>Argument 1: Sender address</Text>
                <Text>Argument 2: Destination address</Text>
                <Text>Argument 3: NFT ID</Text>
                </VStack> : <div></div>
              }
            </Box>
          }
          <FormLabel>Arguments</FormLabel>
          <Textarea
            placeholder="Separate arguments by comma, no space! Currently only supports non-nested arguments"
            value={args}
            onChange={(event) => setArgs(event.target.value)}
          />
          {/* TODO: get rid of this */}
          {/* <FormLabel>Operation</FormLabel>
          <Input
            type="string"
            value={operation}
            onChange={(event) => setOperation(event.target.value)}
          /> */}
          <Button bg="white" onClick={initTxn}>Init Transaction</Button>
        </VStack>
      </FormControl>
    </Box>
  );
}

export default TxnPage;
