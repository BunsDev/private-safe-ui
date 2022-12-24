import { Button, Box, VStack, FormControl, Input, FormLabel } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  onCreateSafe,
} from "../helpers/database";
import api from "../helpers/api.js";

// TODO: make module deployment for safe
// TODO: programmatically add the module
function HomePage() {
  const [safes, setSafes] = useState("");
  const [safe, setSafe] = useState("")
  const [groupId, setGroupId] = useState(0)

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
      const currSafe = safes.filter(e => e.safe == safe)[0]
      if (currSafe == []) {
        // TODO: deploy and add the module
        onCreateSafe(safe, [], groupId)
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
          <Button onClick={initSafe}>Init Safe Module</Button>
        </VStack>
      </FormControl>
    </Box>
  );
}

export default HomePage;
