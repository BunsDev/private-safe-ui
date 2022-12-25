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

// TODO: make module deployment for safe
// TODO: programmatically add the module
function HomePage() {
  const [safes, setSafes] = useState("");
  const [safe, setSafe] = useState("");
  const [groupId, setGroupId] = useState(0);
  const [noModule, setNoModule] = useState(0);
  const [module, setModule] = useAtom(moduleAtom);

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

  function initSafe() {
    if (safes != []) {
      const currSafe = safes.filter((e) => e.safe == safe)[0];
      console.log(currSafe)
      if (currSafe == null) {
        // TODO: deploy and add the module, also add the option to use existing module
        onCreateSafe(safe, [], groupId);
      }
    }
  }

  return (
    <Box p={4}>
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
    </Box>
  );
}

export default HomePage;
