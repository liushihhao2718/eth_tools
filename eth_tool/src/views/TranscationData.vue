<script setup>
import { Interface } from "ethers";
import { ref, computed } from "vue";

const data = ref(
  `0xb88d4fde0000000000000000000000006639c089adfba8bb9968da643c6be208a70d6daa0000000000000000000000001919db36ca2fa2e15f9000fd9cdc2edcf863e6850000000000000000000000000000000000000000000000000000000000000edf00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000360c6ebe`
);
const abi_text = ref(
  `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
);

const parsed_data = ref();
const error_msg = ref();
const signature = computed(() =>
  parsed_data.value.transDesc.fragment.format("full")
);
function parseInputData(abi, data) {
  const pick = (obj, ...keys) =>
    Object.fromEntries(
      keys.filter((key) => key in obj).map((key) => [key, obj[key]])
    );
  const iface = new Interface(abi);
  const parsed = iface.parseTransaction({ data });
  const table = parsed.fragment.inputs.map((x, i) =>
    Object.assign(pick(x, "name", "type"), { value: parsed.args[i].toString() })
  );

  return { table, transDesc: parsed };
}

function decode() {
  clearView();
  try {
    // const abi = JSON.parse(abi_text.value);
    parsed_data.value = parseInputData(abi_text.value, data.value);
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

<template>
  <v-container>
    <h1 style="text-align: center">Decode Transcation Data</h1>

    <h2>ABI</h2>
    <v-textarea label="" variant="outlined" v-model="abi_text"></v-textarea>
    <h2>Data</h2>
    <v-textarea
      label=""
      rows="3"
      variant="outlined"
      v-model="data"
    ></v-textarea>
    <v-btn variant="tonal" @click="decode()"> Decode </v-btn>

    <v-divider :style="{ marginTop: '30px', marginBottom: '30px' }"></v-divider>

    <v-alert
      v-if="error_msg"
      :text="error_msg"
      color="red-lighten-1"
      type="error"
    ></v-alert>
    <div v-else-if="parsed_data">
      <v-spacer class="d-flex" style="align-items: center">
        <h2>Signature</h2>
        <p>&nbsp;</p>
        <v-chip>{{ parsed_data.transDesc.selector }}</v-chip>
      </v-spacer>
      <br />

      <v-alert>{{ signature }}</v-alert>

      <br />
      <h2>Input Data</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">#</th>
            <th class="text-left">Name</th>
            <th class="text-left">Type</th>
            <th class="text-left">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in parsed_data.table" :key="item.name">
            <td>{{ index }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-container>
</template>
