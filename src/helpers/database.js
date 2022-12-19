import api from "./api.js";
import { useAtom } from "jotai";
import { transactionsAtom } from "../utils/atoms";
import { useUpdateAtom } from 'jotai/utils'

// const [transactions, setTransactions] = useAtom(transactionsAtom);

// create a new transaction in database using the generated executeTransaction data
export const onSubmit = (txn) => {
  const t = {
    safe: txn.safe,
    target: txn.form.target,
    calldata: txn.form.data,
    operation: txn.form.operation,
    roots: txn.roots,
    nullifier_hashes: txn.nullifierHashes,
    proofs: txn.proofs,
    voters: txn.voters,
    nonce: txn.nonce,
    value: txn.form.value,
  };

  const input = JSON.stringify(t);
  api
    .post("/create/", input, { headers: { "Content-Type": "application/json" } })
    // .then(() => refreshSafeTransactions());
    .then((res) => console.log(res))
};

// called when a user signs the transaction, we will have the id in the transaction object they can select from on QueuePage
export const onUpdate = (id, roots, nulHashes, proofs, voters) => {
  let item = { roots, nullifier_hashes: nulHashes, proofs, voters };
  api.patch(`/${id}/`, item).then((res) => refreshMovies());
};

export const onDelete = (id) => {
  api.delete(`/${id}/`).then((res) => refreshMovies());
};
