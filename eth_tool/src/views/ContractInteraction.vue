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

          <div v-for="(input, input_i) in fragment.inputs" :key="input.name">
            <v-text-field class="my-2" variant="outlined" v-if="input.components == null"
              v-model="parsed_data.input_data[index][input_i]" hide-details :label="input.name"
              :placeholder="input.type"></v-text-field>

            <div v-else>
              <label>{{ input.name }}</label>
              <v-sheet   class="border rounded px-5 py-2">
                <v-text-field class="my-2" variant="outlined" v-for="(c) in input.components" :key="c.name"
                  v-model="parsed_data.input_data[index][input_i][c.name]" hide-details :label="c.name"
                  :placeholder="c.type"></v-text-field>

              </v-sheet>


            </div>

          </div>

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
  // `[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`
  `[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CreatorPayoutAddressCannotBeZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DuplicateFeeRecipient",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DuplicatePayer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FeeRecipientCannotBeZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FeeRecipientNotAllowed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FeeRecipientNotPresent",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "want",
          "type": "uint256"
        }
      ],
      "name": "IncorrectPayment",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "feeBps",
          "type": "uint256"
        }
      ],
      "name": "InvalidFeeBps",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidProof",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recoveredSigner",
          "type": "address"
        }
      ],
      "name": "InvalidSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maximum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedEndTime",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimumOrMaximum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedFeeBps",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maximum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedMaxTokenSupplyForStage",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maximum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedMaxTotalMintableByWallet",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedMintPrice",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "got",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimum",
          "type": "uint256"
        }
      ],
      "name": "InvalidSignedStartTime",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MintQuantityCannotBeZero",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "allowed",
          "type": "uint256"
        }
      ],
      "name": "MintQuantityExceedsMaxMintedPerWallet",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxSupply",
          "type": "uint256"
        }
      ],
      "name": "MintQuantityExceedsMaxSupply",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxTokenSupplyForStage",
          "type": "uint256"
        }
      ],
      "name": "MintQuantityExceedsMaxTokenSupplyForStage",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "currentTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTimestamp",
          "type": "uint256"
        }
      ],
      "name": "NotActive",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "OnlyINonFungibleSeaDropToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PayerCannotBeZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PayerNotAllowed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PayerNotPresent",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SignatureAlreadyUsed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SignedMintsMustRestrictFeeRecipients",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SignerCannotBeZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SignerNotPresent",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenGatedDropAllowedNftTokenCannotBeDropToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenGatedDropAllowedNftTokenCannotBeZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenGatedDropStageNotPresent",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowedNftTokenId",
          "type": "uint256"
        }
      ],
      "name": "TokenGatedNotTokenOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowedNftTokenId",
          "type": "uint256"
        }
      ],
      "name": "TokenGatedTokenIdAlreadyRedeemed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousMerkleRoot",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newMerkleRoot",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "publicKeyURI",
          "type": "string[]"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "allowListURI",
          "type": "string"
        }
      ],
      "name": "AllowListUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bool",
          "name": "allowed",
          "type": "bool"
        }
      ],
      "name": "AllowedFeeRecipientUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newPayoutAddress",
          "type": "address"
        }
      ],
      "name": "CreatorPayoutAddressUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "newDropURI",
          "type": "string"
        }
      ],
      "name": "DropURIUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bool",
          "name": "allowed",
          "type": "bool"
        }
      ],
      "name": "PayerUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "indexed": false,
          "internalType": "struct PublicDrop",
          "name": "publicDrop",
          "type": "tuple"
        }
      ],
      "name": "PublicDropUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantityMinted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "unitMintPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeBps",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dropStageIndex",
          "type": "uint256"
        }
      ],
      "name": "SeaDropMint",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "minMintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint24",
              "name": "maxMaxTotalMintableByWallet",
              "type": "uint24"
            },
            {
              "internalType": "uint40",
              "name": "minStartTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxEndTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxMaxTokenSupplyForStage",
              "type": "uint40"
            },
            {
              "internalType": "uint16",
              "name": "minFeeBps",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "maxFeeBps",
              "type": "uint16"
            }
          ],
          "indexed": false,
          "internalType": "struct SignedMintValidationParams",
          "name": "signedMintValidationParams",
          "type": "tuple"
        }
      ],
      "name": "SignedMintValidationParamsUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint8",
              "name": "dropStageIndex",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "maxTokenSupplyForStage",
              "type": "uint32"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "indexed": false,
          "internalType": "struct TokenGatedDropStage",
          "name": "dropStage",
          "type": "tuple"
        }
      ],
      "name": "TokenGatedDropStageUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getAllowListMerkleRoot",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getAllowedFeeRecipients",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowedNftTokenId",
          "type": "uint256"
        }
      ],
      "name": "getAllowedNftTokenIdIsRedeemed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getCreatorPayoutAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        }
      ],
      "name": "getFeeRecipientIsAllowed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        }
      ],
      "name": "getPayerIsAllowed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getPayers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getPublicDrop",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct PublicDrop",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "signer",
          "type": "address"
        }
      ],
      "name": "getSignedMintValidationParams",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "minMintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint24",
              "name": "maxMaxTotalMintableByWallet",
              "type": "uint24"
            },
            {
              "internalType": "uint40",
              "name": "minStartTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxEndTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxMaxTokenSupplyForStage",
              "type": "uint40"
            },
            {
              "internalType": "uint16",
              "name": "minFeeBps",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "maxFeeBps",
              "type": "uint16"
            }
          ],
          "internalType": "struct SignedMintValidationParams",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getSigners",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        }
      ],
      "name": "getTokenGatedAllowedTokens",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        }
      ],
      "name": "getTokenGatedDrop",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint8",
              "name": "dropStageIndex",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "maxTokenSupplyForStage",
              "type": "uint32"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct TokenGatedDropStage",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minterIfNotPayer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "mintPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxTotalMintableByWallet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "dropStageIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxTokenSupplyForStage",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "feeBps",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct MintParams",
          "name": "mintParams",
          "type": "tuple"
        },
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        }
      ],
      "name": "mintAllowList",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minterIfNotPayer",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "allowedNftToken",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "allowedNftTokenIds",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct TokenGatedMintParams",
          "name": "mintParams",
          "type": "tuple"
        }
      ],
      "name": "mintAllowedTokenHolder",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minterIfNotPayer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "mintPublic",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minterIfNotPayer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "mintPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxTotalMintableByWallet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "dropStageIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxTokenSupplyForStage",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "feeBps",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct MintParams",
          "name": "mintParams",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "salt",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "mintSigned",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "string[]",
              "name": "publicKeyURIs",
              "type": "string[]"
            },
            {
              "internalType": "string",
              "name": "allowListURI",
              "type": "string"
            }
          ],
          "internalType": "struct AllowListData",
          "name": "allowListData",
          "type": "tuple"
        }
      ],
      "name": "updateAllowList",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "allowed",
          "type": "bool"
        }
      ],
      "name": "updateAllowedFeeRecipient",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "payoutAddress",
          "type": "address"
        }
      ],
      "name": "updateCreatorPayoutAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dropURI",
          "type": "string"
        }
      ],
      "name": "updateDropURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "allowed",
          "type": "bool"
        }
      ],
      "name": "updatePayer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct PublicDrop",
          "name": "publicDrop",
          "type": "tuple"
        }
      ],
      "name": "updatePublicDrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "minMintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint24",
              "name": "maxMaxTotalMintableByWallet",
              "type": "uint24"
            },
            {
              "internalType": "uint40",
              "name": "minStartTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxEndTime",
              "type": "uint40"
            },
            {
              "internalType": "uint40",
              "name": "maxMaxTokenSupplyForStage",
              "type": "uint40"
            },
            {
              "internalType": "uint16",
              "name": "minFeeBps",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "maxFeeBps",
              "type": "uint16"
            }
          ],
          "internalType": "struct SignedMintValidationParams",
          "name": "signedMintValidationParams",
          "type": "tuple"
        }
      ],
      "name": "updateSignedMintValidationParams",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "allowedNftToken",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint8",
              "name": "dropStageIndex",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "maxTokenSupplyForStage",
              "type": "uint32"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct TokenGatedDropStage",
          "name": "dropStage",
          "type": "tuple"
        }
      ],
      "name": "updateTokenGatedDrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`
);
const glob_abi = import.meta.glob("../preset_contract/*.json");

const presets = Object.keys(glob_abi)
  .map((path) => {
    return {
      path, name: path.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, "")
    }
  })

const tab = ref(0);
const select_preset = ref(presets[1].name);

const parsed_data = ref();
const error_msg = ref();

function parseData(abi) {
  const iface = new Interface(abi);
  const table = iface.fragments.filter((x) => x.type == "function");
  console.table(table);

  const input_data = table.map((t) => t.inputs.map((x) => x.components ? {} : null));
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
