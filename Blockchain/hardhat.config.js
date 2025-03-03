import "@nomicfoundation/hardhat-toolbox";
import "@solarity/hardhat-zkit";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
    solidity: "0.8.24",
    networks: {
      electroneum_testnet: {
        url: "https://rpc.ankr.com/electroneum_testnet",
        accounts: [
          "0x58d660e77e4ed1057937d8813155347e0b967fbd5197150f264191ec8fc2876a",
        ],
      },
    },
  };
  
  export default config;