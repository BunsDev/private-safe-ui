import { encodeSingle, TransactionType } from "ethers-multisend";

// gives you all of the inputs to the executeTransaction contract call

export function getCalldata(txn) {
  // address val in solidity, string val in js
  const to = txn.form.target;

  // const value = utils.formatEther(txn.formInfo.value)
  const value = txn.form.value;

  const a = txn.form.args;

  const type = txn.form.type;

  if (type == "ERC20") {
    // have user pass in info about erc20 token decimals + recipient
    const metaTxn = encodeSingle({
      type: TransactionType.transferFunds,
      id: "0", // not relevant for encoding the final transaction
      // token: txn.target | null, // ERC20 token contract address, `null` or empty string for ETH
      token: to,
      to: a[0], // address of recipient
      amount: value, // string representation of the value formatted with the token's decimal digits, e.g., "1.0" for 1 ETH
      decimals: txn.form.decimals, // decimal places of the token
    });
    return metaTxn;
  } else if (type == "ERC721") {
    const metaTxn = encodeSingle({
      type: TransactionType.transferCollectible,
      id: "0", // not relevant for encoding the final transaction
      address: to, // ERC721 contract address
      tokenId: a[2], // ID of the NFT
      to: a[1], // address of recipient
      from: a[0], // address of sender
    });
    return metaTxn;
  } else if (type == "contract") {
    const metaTxn = encodeSingle({
      type: TransactionType.callContract,
      id: "0", // not relevant for encoding the final transaction
      to: to, // contract address
      value: value, // amount of wei to send
      abi: txn.form.contract, // ABI as JSON string
      functionSignature: txn.form.func,
      inputValues: {}
    });
    return metaTxn;
  } else if (type == "ETH") {
    const metaTxn = encodeSingle({
      type: TransactionType.transferFunds,
      id: "0", // not relevant for encoding the final transaction
      // token: txn.target | null, // ERC20 token contract address, `null` or empty string for ETH
      token: null,
      to: to, // address of recipient
      amount: value, // string representation of the value formatted with the token's decimal digits, e.g., "1.0" for 1 ETH
      decimals: 18, // decimal places of the token
    });

    return metaTxn;
  } else {
    console.log(type);
    console.log("wrong type");
  }
}
