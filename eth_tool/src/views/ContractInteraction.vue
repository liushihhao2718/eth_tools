<template>
  <v-container>
    <h1 style="text-align: center">Contract Interaction</h1>
    <p style="margin-top: 15px" v-if="FROM">Address: {{ FROM }}</p>
    <v-btn variant="tonal" v-else @click="connect()">Connect</v-btn>
    <v-divider class="my-4"></v-divider>
    <v-text-field label="Contract Address" v-model="contractAddress"></v-text-field>
    <v-divider class="my-4"></v-divider>
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
        <v-select v-model="select_preset" :items="presets.map((x) => x.name)" label="Pre defined Contracts"></v-select>
        <v-btn variant="tonal" @click="getPreset()"> Format </v-btn>
      </v-window-item>
    </v-window>
    <v-divider :style="{ marginTop: '30px', marginBottom: '30px' }"></v-divider>
    <v-alert v-if="error_msg" :text="error_msg" color="red-lighten-1" type="error"></v-alert>
    <v-expansion-panels v-else-if="parsed_data" :style="{ maxWidth: '1200px', margin: 'auto' }">
      <v-expansion-panel v-for="(fragment, index) in parsed_data.table" :key="fragment.format()">
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
                        .join(", ")
                    }}
                  </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field class="my-2" variant="outlined" v-for="(input, input_i) in fragment.inputs" :key="input.name"
            v-model="parsed_data.input_data[index][input_i]" hide-details :label="input.name"
            :placeholder="input.type"></v-text-field>
          <v-btn @click="interact(index, parsed_data.table[index], parsed_data.input_data[index])">Run</v-btn>
          <v-divider class="my-4"></v-divider>
          <v-alert v-if="parsed_data.outputs[index]" :text="parsed_data.outputs[index].result"
            :type="parsed_data.outputs[index].type"></v-alert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <br />
  </v-container>
</template>

<script setup>
import { Contract, ethers, Interface } from "ethers";
import { ref } from "vue";


const contractAddress = ref('0xe7DFd7C53145cf9E68D67c12Cf3D3FEa67a7106f');
let abi;
/**
 * @type {import('ethers').BrowserProvider}
 */
let provider;
const FROM = ref("");
async function connect() {
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  FROM.value = (await provider.getSigner()).address;
  console.log(FROM.value);
}


const abi_text = ref(
  `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
);
const glob_abi = import.meta.glob("../preset_contract/*.json");
const regex = /\.\.\/preset_contract\/(ERC(\d+))\.json/;

// console.log(Object.keys(data));

const presets = Object.keys(glob_abi)
  .map((path) => {
    return {
      path, name: path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
    }
  })

const tab = ref(0);
const select_preset = ref(presets[1].name);

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
    abi = JSON.parse(abi_text.value);
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
  const index = presets.map((x) => x.name).indexOf(select_preset.value);
  abi = (await glob_abi[presets[index].path]()).default;

  try {
    clearView();
    parseData(abi);
  } catch (e) {
    console.error(e);
    error_msg.value = e.message;
  }
}

async function interact(index, fragment, input) {

  try {
    const contract = new Contract(contractAddress.value, abi, await provider.getSigner());
    console.log('fragment.name', fragment.name, ...input)
    const result = await contract[fragment.name](...input);

    console.log(result)
    if (fragment.constant) {
      parsed_data.value.outputs[index] = {
        result: JSON.stringify(result, (key, value) => {
          return typeof value === 'bigint'
            ? value.toString()
            : value;
        },
          2

        ), type: ''
      };
    }
    else {
      parsed_data.value.outputs[index] = { result: result.hash, type: '' };
    }
  } catch (e) {
    parsed_data.value.outputs[index] = { result: e.message, type: 'error' }
  }



}
</script>
