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
} from "@chakra-ui/react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";
import {
  queueAtom,
  nonceAtom,
  groupAtom,
  groupIdAtom,
} from "../utils/atoms.js";
import { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
const { Group } = require("@semaphore-protocol/group");
import { Subgraph } from "@semaphore-protocol/subgraph";
import { packToSolidityProof, generateProof } from "@semaphore-protocol/proof";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ContractFactory, ethers } from "ethers";
import privateModule from "../utils/PrivateModule.js";
import semaphore from "../utils/Semaphore.js";
import { useAtom } from "jotai";

import { getCalldata } from "../helpers/txnInputs";
import {
  onSubmit,
  refreshSafeTransactions,
  onCreateSafe,
  onUpdateSafe,
} from "../helpers/database";
import api from "../helpers/api.js";

function TxnPage() {
  const [target, setTarget] = useState("");
  const [value, setValue] = useState(0);
  const [func, setFunc] = useState("");
  const [args, setArgs] = useState("");
  const [operation, setOperation] = useState("");
  const [txnType, setTxnType] = useState("");
  const [decimals, setDecimals] = useState(0);
  const [contract, setContract] = useState("");
  const [safes, setSafes] = useState([]);
  const [currSafe, setCurrSafe] = useState({});
  const [queue, setQueue] = useAtom(queueAtom); // an array of dictionaries, ordered by when the transaction was added
  const [nonce, setNonce] = useAtom(nonceAtom);
  const [groupId, setGroupId] = useAtom(groupIdAtom);
  const [group, setGroup] = useAtom(groupAtom);
  const [currRoot, setCurrRoot] = useState(-1);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { data: signer } = useSigner();

  const moduleContract = useContract({
    address: "0x5BDfc497B21D58656556703DeE95AAA475b6bA66",
    abi: privateModule["abi"],
    signerOrProvider: signer,
  });

  const semaphoreContract = useContract({
    address: "0x5259d32659F1806ccAfcE593ED5a89eBAb85262f",
    abi: semaphore,
    signerOrProvider: signer,
  });

  const safe = "0xC3ACf93b1AAA0c65ffd484d768576F4ce106eB4f";

  useEffect(() => {
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

      // get the user to generate a deterministic identity
      const { trapdoor, nullifier, commitment } = new Identity(address);

      // add to group
      console.log(moduleContract);
      const signedId = signer.signMessage(commitment);
      const b32user = ethers.utils.formatBytes32String(signedId);

      const addSigner = await moduleContract.joinAsSigner(commitment, b32user);

      console.log(addSigner);

      // get safe
      // TODO: remove the hardcoded safe
      const curr = safes.filter((e) => e.safe == safe)[0];
      setCurrSafe(curr);
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
    // get address, re-generate the identity
    const identity = new Identity(address);

    const vote = ethers.utils.formatBytes32String(nonce);

    const bnGroupId = await moduleContract.groupId();
    const gId = bnGroupId.toNumber();
    console.log(gId);
    setGroupId(gId);

    const offchainGroup = new Group();
    const members = await moduleContract.queryFilter(
      moduleContract.filters.NewUser()
    );
    console.log(members);
    const memberIds = members.map((e) => e.args[0].toString());
    offchainGroup.addMembers(memberIds);
    console.log(ethers.BigNumber.from(members[0].args[0]._hex));

    setGroup(offchainGroup);
    console.log(offchainGroup);

    // onCreateSafe(safe, memberIds, gId)

    // currRoot is the external nullifier that corresponds to the group
    const fullProof = await generateProof(identity, offchainGroup, gId, vote);

    console.log(fullProof);

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
    console.log(sepArgs);

    // for eth transaction, we only need value, target, and operation
    // data is function selector
    console.log("printing txnType");
    console.log(txnType);

    const txn = {
      safe: safe,
      nonce: nonce,
      form: {
        target: target,
        value: value,
        data: null,
        args: sepArgs,
        operation: operation,
        type: txnType,
        decimals: decimals,
        // abi
        contract: contract,
      },
      roots: treeRoots,
      nullifierHashes: nulHashes,
      proofs: proofs,
      voters: voters,
    };

    // generate and update data field of txn
    const calldata = getCalldata(txn);
    txn["form"]["data"] = calldata;

    setQueue([...queue, txn]);

    // make a post request, initializing the transaction in the database
    const submitToDb = onSubmit(txn);
    console.log(submitToDb);
  }

  return (
    <Box p={4}>
      <VStack
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
      </VStack>

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
                  <FormLabel>ABI</FormLabel>
                  <Textarea
                    type="string"
                    value={contract}
                    onChange={(event) => setContract(event.target.value)}
                    placeholder="contract abi"
                  />
                </Box>
              ) : (
                <div>
                  {txnType == "ERC721" ? (
                <Box>
                  <FormLabel>ABI</FormLabel>
                  <Textarea
                    type="string"
                    value={contract}
                    onChange={(event) => setContract(event.target.value)}
                    placeholder="contract abi"
                  />
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
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ether value (e.g. 1.0)"
          />
          <FormLabel>Function Selector</FormLabel>
          <Input
            type="string"
            value={func}
            onChange={(event) => setFunc(event.target.value)}
          />
          <FormLabel>Arguments</FormLabel>
          <Textarea
            placeholder="Separate arguments by comma, no space! Currently only supports non-nested arguments"
            value={args}
            onChange={(event) => setArgs(event.target.value)}
          />
          {/* TODO: get rid of this */}
          <FormLabel>Operation</FormLabel>
          <Input
            type="string"
            value={operation}
            onChange={(event) => setOperation(event.target.value)}
          />
          <Button onClick={initTxn}>Init Transaction</Button>
        </VStack>
      </FormControl>
    </Box>
  );
}

export default TxnPage;
