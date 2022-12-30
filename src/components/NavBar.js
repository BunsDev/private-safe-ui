import { Flex, Box, defineStyle, defineStyleConfig } from "@chakra-ui/react";

import { useState } from "react";
import { Link } from "react-router-dom";

const brandPrimary = defineStyle({
  color: "white",
  fontFamily: "monospace",
  fontWeight: "normal",
});

export const linkTheme = defineStyleConfig({
  variants: { brand: brandPrimary },
});

function NavBar() {
  return (
    <Box bg="#008c73" borderRadius="28px">
      <Flex flexDirection="row">
        <Box p={4} pl={10}>
          <Link variant="brand" to="/">
            Home
          </Link>
        </Box>
        <Box p={4}>
          <Link variant="brand" to="/transaction">
            Transaction
          </Link>
        </Box>
        <Box p={4}>
          <Link to="/queue" variant="brand">
            Queue
          </Link>
        </Box>
      </Flex>
    </Box>
  );
}

export default NavBar;
