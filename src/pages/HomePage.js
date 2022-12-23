import { Button, Box, VStack, FormControl, Input, FormLabel } from "@chakra-ui/react";
import { useState } from "react";
import {
  onCreateSafe,
} from "../helpers/database";

// TODO: make module deployment for safe
// TODO: programmatically add the module
function HomePage() {
  const [safe, setSafe] = useState("");
  const [groupId, setGroupId] = useState(0);

  function initSafe() {
    onCreateSafe(safe, [], groupId)
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
