<template>
  <v-container>
    <h1 style="text-align: center">Contract Interaction</h1>

    <h2>ABI</h2>
    <v-tabs v-model="tab" color="blue" grow>
      <v-tab value="one">Input</v-tab>
      <v-tab value="two">Preset</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="one">
        <v-textarea label="" variant="outlined" v-model="abi_text"></v-textarea>
        <v-btn variant="tonal" @click="decode()"> Format </v-btn>
      </v-window-item>

      <v-window-item value="two">
        <v-select
          v-model="select_preset"
          :items="presets.map((x) => x[1])"
          label="Pre defined Contracts"
        ></v-select>
        <v-btn variant="tonal" @click="getPreset()"> Format </v-btn>
      </v-window-item>
    </v-window>
    <v-divider :style="{ marginTop: '30px', marginBottom: '30px' }"></v-divider>
    <v-alert
      v-if="error_msg"
      :text="error_msg"
      color="red-lighten-1"
      type="error"
    ></v-alert>
    <v-expansion-panels
      v-else-if="parsed_data"
      :style="{ maxWidth: '1200px', margin: 'auto' }"
    >
      <v-expansion-panel
        v-for="(fragment, index) in parsed_data.table"
        :key="fragment.format()"
      >
        <v-expansion-panel-title>
          <template v-slot:default="">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start">
                {{ fragment.name }}
              </v-col>
              <v-col cols="8" class="text-grey">
                <v-fade-transition leave-absolute>
                  <span>
                    {{
                      fragment.inputs
                        .map((i) => `${i.type} ${i.name}`)
                        .join(",  ")
                    }}
                  </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field
            class="my-2"
            variant="outlined"
            v-for="(input, input_i) in fragment.inputs"
            :key="input.name"
            v-model="parsed_data.input_data[index][input_i]"
            hide-details
            :label="input.name"
            :placeholder="input.type"
          ></v-text-field>
          <v-btn @click="interact(parsed_data.input_data[index])">Run</v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <br />
  </v-container>
</template>

<script setup>
import { Interface } from "ethers";
import { ref } from "vue";

const abi_text = ref(
  `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
);
const data = import.meta.glob("../preset_contract/*.json");
const regex = /\.\.\/preset_contract\/(ERC(\d+))\.json/;

// console.log(Object.keys(data));

const presets = Object.keys(data)
  .map((path) => regex.exec(path))
  .sort(function (a, b) {
    return a[2] - b[2];
  });

const tab = ref(0);
// const presets = ref(["ERC20", "ERC721", "ERC1155"]);
const select_preset = ref(presets[1][1]);

const expanded = ref(false);
const parsed_data = ref();
const error_msg = ref();

function parseData(abi) {
  const iface = new Interface(abi);
  const table = iface.fragments.filter((x) => x.type == "function");
  // console.table(table);

  const input_data = table.map((t) => t.inputs.map(() => []));
  const outputs = Array(table.length);

  // console.log("input_data", input_data);
  parsed_data.value = { table, input_data, outputs };
}

function decode() {
  clearView();
  try {
    const abi = JSON.parse(abi_text.value);
    parseData(abi);
  } catch (e) {
    console.error(e);
    error_msg.value = e.message;
  }
}
function clearView() {
  error_msg.value = undefined;
  parsed_data.value = undefined;
}

async function getPreset() {
  const index = presets.map((x) => x[1]).indexOf(select_preset.value);
  const abi = (await data[presets[index][0]]()).default;

  try {
    clearView();
    parseData(abi);
  } catch (e) {
    console.error(e);
    error_msg.value = e.message;
  }
}

async function interact(input) {
  console.log(input);
}
</script>
