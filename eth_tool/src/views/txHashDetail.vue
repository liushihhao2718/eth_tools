<template>
  <v-container>
    <h1 style="text-align: center">Transcation</h1>
    <p style="margin-top: 15px" v-if="FROM">Address: {{ FROM }}</p>
    <v-btn variant="tonal" v-else @click="connect()">Connect</v-btn>

    <v-divider class="my-4"></v-divider>

    <h2>ABI</h2>
    <v-textarea label="" variant="outlined" v-model="abi_text"></v-textarea>
    <v-text-field label="txHash" v-model="txHash"></v-text-field>
    <v-btn variant="tonal" @click="decodeTransctaion()">Decode</v-btn>

    <v-divider class="my-4"></v-divider>
    <v-alert
      v-if="error_msg"
      :text="error_msg"
      color="red-lighten-1"
      type="error"
    ></v-alert>
    <v-card
      v-if="tx"
      :style="{ margin: 'auto', maxWidth: '1000px', padding: '20px' }"
    >
      <h2 class="mb-4">Transaction Details</h2>

      <v-row v-if="tx">
        <v-col cols="3">Transaction Hash:</v-col>
        <v-col cols="9">{{ tx.hash }}</v-col>
      </v-row>
      <v-row v-if="recipt">
        <v-col cols="3">Status:</v-col>
        <v-col cols="9">{{ recipt.status == 1 ? "Success" : "Failed" }}</v-col>
      </v-row>
      <v-row v-if="tx">
        <v-col cols="3">Block:</v-col>
        <v-col cols="9">{{ tx.blockNumber }}</v-col>
      </v-row>
      <v-row v-if="block">
        <v-col cols="3">Timestamp:</v-col>
        <v-col cols="9">{{
          new Date(block.timestamp * 1000).toLocaleString()
        }}</v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <v-row v-if="recipt">
        <v-col cols="3">From:</v-col>
        <v-col cols="9">{{ recipt.from }}</v-col>
      </v-row>
      <v-row v-if="recipt">
        <v-col cols="3">To:</v-col>
        <v-col cols="9">{{ recipt.to }}</v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <v-row v-if="tx">
        <v-col cols="3">Value:</v-col>
        <v-col cols="9">{{ tx.value }} wei</v-col>
      </v-row>
      <v-row v-if="recipt">
        <v-col cols="3">Fee:</v-col>
        <v-col cols="9"
          >{{ ethers.formatUnits(recipt.fee, "gwei") }} gwei</v-col
        >
      </v-row>
    </v-card>
    <div class="my-5"></div>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { ethers } from "ethers";
/**
 * @type {import('ethers').BrowserProvider}
 */
let provider;
const FROM = ref("");
const abi_text = ref(
  `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
);
const txHash = ref(
  "0x1a05acb5213ff1851b678661243950108efaee934be1495a09eccf720dc29aae"
);

const parsed_data = ref();
const error_msg = ref();
const tx = ref();
const recipt = ref();
const block = ref();
async function connect() {
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  FROM.value = (await provider.getSigner()).address;
  console.log(FROM.value);
}

async function decodeTransctaion() {
  clearView()
  try {
    if(!provider) throw new Error('please connect wallet')

    const _tx = await provider.getTransaction(txHash.value);
    console.log(_tx);
    tx.value = _tx;

    const _block = await _tx.getBlock();
    block.value = _block;
    const _recipt = await _tx.wait();

    recipt.value = _recipt;

    console.log(_recipt.fee);
  } catch (e) {
    console.error(e);
    error_msg.value = e.message;
  }
}

function clearView() {
  error_msg.value = undefined;
  parsed_data.value = undefined;
}
</script>
