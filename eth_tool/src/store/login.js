import { ethers } from "ethers";
let provider;

async function connect() {
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  FROM.value = (await provider.getSigner()).address;
  console.log(FROM.value);
}


export {
  provider,
  
}