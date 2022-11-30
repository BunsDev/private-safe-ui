import {
    Button,
    ButtonGroup,
    FormControl,
    Input,
    FormLabel,
    Flex,
    Box,
    VStack,
    HStack,
    GridItem
} from "@chakra-ui/react";
import { useAtom } from 'jotai';
import { queueAtom } from '../utils/atoms.js';

function QueuePage() {
    const [queue, setQueue] = useAtom(queueAtom);

    function getTransactionData(e) {
        /*
        nonce -
        address to - 
        calldata (function and args) - 
        eth value 
        operation

        num signatures - 
        button to sign -
        button to execute - 
        */
        return (
            <VStack p={4} spacing="10px" display="flex" flexDirection="column" alignItems="flex-start" borderRadius='10px' borderWidth='1px' borderColor="grey" borderStyle= "solid">
                <HStack spacing="10px" borderStyle= "solid" borderColor="grey">
                    <Box>{e.nonce}</Box>
                    <Box>{e.formInfo.target}</Box>
                    <Box>{e.formInfo.data}</Box>
                    <Box>{e.voters.length} signers</Box>
                </HStack>
                <HStack spacing="10px" borderStyle= "solid" borderColor="grey">
                    <Box>{e.formInfo.operation}</Box>
                    <Box>{e.formInfo.value}</Box>
                </HStack>
                <HStack spacing="10px">
                    <Button>Sign</Button>
                    <Button>Execute</Button>
                </HStack>
            </VStack>
        )
    }


    return (
        <Box p={6}>
            {
                queue.map(getTransactionData)
            }
        </Box>
    )
}

export default QueuePage;