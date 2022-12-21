import { encodeSingle, TransactionType } from "ethers-multisend"

// gives you all of the inputs to the executeTransaction contract call

export function getCalldata(txn) {
    // address val in solidity, string val in js
    const to = txn.form.target

    // wei u256 value in solidity, int in js
    // TODO: users must pass in wei - if not eth transfer ??? 
    // const value = ethers.BigNumber.from(txn.formInfo.value)

    // const value = utils.formatEther(txn.formInfo.value)
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
            decimals: txn.formInfo.decimals // decimal places of the token
        })
        return metaTxn.data

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

        return metaTxn.data

    } else {
        console.log(type)
        console.log("wrong type")
    }

}

// most likely don't use this... 
export function getTxnInputs(txn) {

    const type = txn.formInfo.type 
    console.log('printing queuepage txn type')
    console.log(type)

    if (type == "ERC20") {
        // have user pass in info about erc20 token decimals + recipient

    } else if (type == "ERC721") {
        // have user pass in recipient + tokenId

    } else if (type == "contract") {
        // TODO: take in ABI as input

    } else if (type == "ETH") {

        return {
            to: to,
            value: metaTxn.value, 
            data: currCalldata, 
            operation: operation,
            roots: txn.roots, 
            nulHashes: txn.nullifierHashes, 
            proofs: txn.proofs, 
            voters: txn.voters
        }

    } else {
        console.log(type)
        console.log("wrong type")
    }
  }