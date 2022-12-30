import {
  Button,
  Box,
  VStack,
  FormControl,
  Input,
  FormLabel,
  Stack,
  RadioGroup,
  Radio
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { onCreateSafe } from "../helpers/database";
import api from "../helpers/api.js";
import { useAtom } from "jotai";
import { moduleAtom } from "../utils/atoms.js";
import { InjectedConnector } from "wagmi/connectors/injected";
import privateModule from "../utils/PrivateModule.js";
import semaphore from "../utils/Semaphore.js";
import { Identity } from "@semaphore-protocol/identity";
import { ethers } from "ethers";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";

import {
  onSubmit,
  refreshSafeTransactions,
  onCreateSafe,
  onUpdateSafe,
} from "../helpers/database";
import api from "../helpers/api.js";

// TODO: make module deployment for safe
// TODO: programmatically add the module
function HomePage() {
  const [safes, setSafes] = useState("");
  const [safe, setSafe] = useState("");
  const [groupId, setGroupId] = useState(0);
  const [noModule, setNoModule] = useState(0);
  const [module, setModule] = useAtom(moduleAtom);

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

  async function initSafe() {

    const groups = await moduleContract.queryFilter(
      moduleContract.filters.DebugGroup()
    );
    console.log(groups)

    const id = await moduleContract.groupId();
    console.log(id)

    //GroupCreated(groupId, merkleTreeDepth, zeroValue)
    const semaGroup = await semaphoreContract.queryFilter(
      semaphoreContract.filters.GroupCreated()
    );
    console.log(semaGroup)

    if (safes != []) {
      const currSafe = safes.filter((e) => e.safe == safe)[0];
      console.log(currSafe)
      if (currSafe == null) {
        // TODO: deploy and add the module, also add the option to use existing module

        // if already deployed
        const members = await moduleContract.queryFilter(
          moduleContract.filters.NewUser()
        );
        console.log(members);
        const memberIds = members.map((e) => e.args[0].toString());

        onCreateSafe(safe, memberIds, groupId);
      }
    }
  }

  async function createIdentity() {
    if (isConnected) {
      console.log("isConnected");

      // get safe
      // TODO: remove the hardcoded safe
      const curr = safes.filter((e) => e.safe == safe)[0];
      console.log(curr)
      // setCurrSafe(curr);

      // get the user to generate a deterministic identity
      const { trapdoor, nullifier, commitment } = new Identity(address);
      console.log(commitment)

      // add to group
      console.log(moduleContract);
      const signedId = signer.signMessage(commitment);
      const b32user = ethers.utils.formatBytes32String(signedId);
      console.log(b32user)

      const addSigner = await moduleContract.joinAsSigner(commitment, b32user, { gasLimit: 500000});

      console.log(addSigner);
      // update the members in our backend

      //NewUser(identityCommitment, username);

      const updateMembers = await moduleContract.on(
        "NewUser",
        (identityCommitment, username) => {
          // update db
          console.log(identityCommitment);
          const idNum = identityCommitment.toString();
          console.log(idNum)
          const updatedMems = [...curr.group_members, idNum];
          onUpdateSafe(curr.pk, updatedMems);
        }
      );

      console.log(updateMembers);
    } else {
      console.log("not connected to web3");
    }
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
      </VStack>

      <FormControl>
        <VStack spacing="10px" alignItems="flex-start">
          <FormLabel>Safe Address</FormLabel>
          <Input
            type="string"
            value={safe}
            onChange={(event) => setSafe(event.target.value)}
            placeholder=""
          />
          <FormLabel>Group Id</FormLabel>
          <Input
            type="number"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            placeholder="Only add a group id if your safe does not have a module"
          />

          <RadioGroup onChange={setNoModule} value={noModule}>
            <Stack direction="row">
              <Radio value={1} colorScheme='green'>Existing Module</Radio>
              <Radio value={2} colorScheme='green'>New Module</Radio>
            </Stack>
          </RadioGroup>
          {noModule == 1 ? (
            <Box>
              <FormLabel>Module Address</FormLabel>
              <Input
                type="string"
                value={module}
                onChange={(event) => setModule(event.target.value)}
                placeholder=""
              />
            </Box>
          ) : (
            <div>
            </div>
          )}

          <Button onClick={initSafe}>Init Safe Module</Button>
        </VStack>
      </FormControl>
      <Button p={4} onClick={createIdentity}>
        Create Identity
      </Button>
    </Box>
  );
}

export default HomePage;
