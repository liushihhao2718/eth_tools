<template>
  <v-container>
    <h1 style="text-align: center">ABI Decode</h1>

    <h2>ABI</h2>
    <v-textarea label="" variant="outlined" v-model="abi_text"></v-textarea>
    <v-btn variant="tonal" @click="decode()"> Decode </v-btn>
    <v-divider :style="{ marginTop: '30px', marginBottom: '30px' }"></v-divider>
    <v-alert
      v-if="error_msg"
      :text="error_msg"
      color="red-lighten-1"
      type="error"
    ></v-alert>
    <v-table v-else-if="parsed_data">
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Type</th>
          <th class="text-left">Selector</th>
          <th class="text-left">TopicHash</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in parsed_data.table" :key="item.name">
          <td>{{ item.name }}</td>
          <td>
            <v-chip :color="type_color[item.type]">{{ item.type }}</v-chip>
          </td>
          <td>{{ item.selector }}</td>
          <td>{{ item.topicHash }}</td>
        </tr>
      </tbody>
    </v-table>
    <br>
  </v-container>
</template>

<script setup>
import { Interface } from "ethers";
import { ref } from "vue";

const type_color = {
  function: 'green',
  event: 'blue',
  constructor:'gray'
}

const abi_text = ref(
  `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
);
const parsed_data = ref();
const error_msg = ref();

function decode() {
  clearView();
  try {
    const abi = JSON.parse(abi_text.value);
    const iface = new Interface(abi);
    const table = iface.fragments.map((f) => {
      return {
        type: f.type,
        name: f.name,
        selector: f.selector,
        topicHash: f.topicHash,
      };
    }).sort((a, b) => a.type.charCodeAt(0) - b.type.charCodeAt(0));
    console.table(table);
    parsed_data.value = { table };
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
