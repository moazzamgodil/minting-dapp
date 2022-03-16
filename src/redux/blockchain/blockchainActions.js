// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// Wallet Connect
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { INFURA_ID, INFURA_URL } from "../../infura";

// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

const isMobileDevice = () => {
  return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

export const connect = (walletName = '') => {
  if (isMobileDevice()) {
    const dappUrl = window.location.host;
    const metamaskAppDeepLink = "https://metamask.app.link/dapp/" + dappUrl;
    const { ethereum } = window;
    if(!ethereum) {
      if(walletName === 'metamask' || walletName == '') {
        return (
          window.location = metamaskAppDeepLink
        );
      } 
    }
  }
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    const { ethereum } = window;

    //  Create WalletConnect Provider
    const WCProvider = new WalletConnectProvider({
      infuraId: INFURA_ID,
    });

    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: CONFIG.NFT_NAME,
      appLogoUrl: "/config/images/logo.png",
      darkMode: false
    })

    // Initialize a Web3 Provider object
    const CBProvider = coinbaseWallet.makeWeb3Provider(INFURA_URL, CONFIG.NETWORK.ID)

    let metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    let coinbaseIsInstalled = CBProvider && CBProvider.isCoinbaseWallet;
    let providerMetamask;
    if(ethereum) {
      if(ethereum.providers != undefined) {
        providerMetamask = ethereum.providers.find((provider) => provider.isMetaMask);
      } else {
        providerMetamask = ethereum;
      }
    } else if(!isMobileDevice) {
      dispatch(connectFailed("No wallet found."));
      return;
    }

    if (metamaskIsInstalled || coinbaseIsInstalled) {
      let providerETH = '';
      if( walletName === 'metamask' || walletName == '' ) {
        if(metamaskIsInstalled) {
          providerETH = providerMetamask;
        } else {
          dispatch(connectFailed("Install Metamask."));
          return;
        }
      } else if( walletName === 'coinbase' ) {
        if(coinbaseIsInstalled) {
          providerETH = CBProvider;
        } else {
          dispatch(connectFailed("Install Coinbase Wallet."));
          return;
        }
      } else if( walletName === 'walletconnect' ) {
        if(WCProvider) {
          await WCProvider.enable();
          providerETH = WCProvider;
        } else {
          dispatch(connectFailed("WalletConnect not working"));
          return;
        }
      }
      let web3 = new Web3(providerETH);
      Web3EthContract.setProvider(providerETH);
      try {
        const accounts = await providerETH.request({ 
          method: providerETH.isWalletConnect ? 'eth_accounts' : 'eth_requestAccounts'
        });

        const networkId = await providerETH.request({
          method: "net_version",
        });
        if (networkId != CONFIG.NETWORK.ID) {
          try {
            await providerETH.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x4' }],
            });
          } catch(ee) {
            dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
            return;
          }
        }
        const SmartContractObj = new Web3EthContract(
          abi,
          CONFIG.CONTRACT_ADDRESS
        );
        dispatch(
          connectSuccess({
            account: accounts[0],
            smartContract: SmartContractObj,
            web3: web3,
            provider: providerETH,
          })
        );
        // Add listeners start
        providerETH.on("accountsChanged", (accounts) => {
          dispatch(updateAccount(accounts[0]));
        });
        // Add listeners end
        
      } catch (err) {
        if(typeof(err.message) == "string") {
          dispatch(connectFailed(err.message));
        } else {
          dispatch(connectFailed("Something went wrong."));
        }
      }
    } else {
      if( walletName === 'metamask' ) {
        dispatch(connectFailed("Install Metamask."));
      } else if( walletName === 'coinbase' ) {
        dispatch(connectFailed("Install Coinbase Wallet."));
      } else {
        dispatch(connectFailed("Install Metamask OR Coinbase Wallet."));
      }
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};

export const getTotalSupply = () => {
  return async (dispatch) => {
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    const { ethereum } = window;
    if (ethereum) {
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);
      const networkId = await ethereum.request({
        method: "net_version",
      });
      if (networkId == CONFIG.NETWORK.ID) {
        const SmartContractObj = new Web3EthContract(
          abi,
          CONFIG.CONTRACT_ADDRESS
        );
        dispatch(
          connectSuccess({
            account: '',
            smartContract: SmartContractObj,
            web3: web3,
          })
        );
        dispatch(fetchData());
      } else {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4' }],
          });
        } catch (switchError) {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      }
    } else if(!isMobileDevice) {
      dispatch(connectFailed("Install Metamask OR Coinbase Wallet."));
    }
  }
}

const METAMASK_POSSIBLE_ERRORS = 
{
    '-32700': {
        standard: 'JSON RPC 2.0',
        message: 'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    },
    '-32600': {
        standard: 'JSON RPC 2.0',
        message: 'The JSON sent is not a valid Request object.',
    },
    '-32601': {
        standard: 'JSON RPC 2.0',
        message: 'The method does not exist / is not available.',
    },
    '-32602': {
        standard: 'JSON RPC 2.0',
        message: 'Invalid method parameter(s).',
    },
    '-32603': {
        standard: 'JSON RPC 2.0',
        message: 'Internal JSON-RPC error.',
    },
    '-32000': {
        standard: 'EIP-1474',
        message: 'Invalid input.',
    },
    '-32001': {
        standard: 'EIP-1474',
        message: 'Resource not found.',
    },
    '-32002': {
        standard: 'EIP-1474',
        message: 'Resource unavailable.',
    },
    '-32003': {
        standard: 'EIP-1474',
        message: 'Transaction rejected.',
    },
    '-32004': {
        standard: 'EIP-1474',
        message: 'Method not supported.',
    },
    '-32005': {
        standard: 'EIP-1474',
        message: 'Request limit exceeded.',
    },
    '4001': {
        standard: 'EIP-1193',
        message: 'User rejected the request.',
    },
    '4100': {
        standard: 'EIP-1193',
        message: 'The requested account and/or method has not been authorized by the user.',
    },
    '4200': {
        standard: 'EIP-1193',
        message: 'The requested method is not supported by this Ethereum provider.',
    },
    '4900': {
        standard: 'EIP-1193',
        message: 'The provider is disconnected from all chains.',
    },
    '4901': {
        standard: 'EIP-1193',
        message: 'The provider is disconnected from the specified chain.',
    },
}

export const getErrorMessage = async (err) => {
  const { ethereum } = window;
  if (ethereum) {
    let web3 = new Web3(ethereum);
    if(err.code) {
      if(METAMASK_POSSIBLE_ERRORS[err.code]) {
        return METAMASK_POSSIBLE_ERRORS[err.code].message;
      } else if(err.code = 4001) {
        return err.message;
      }
    }
    let chkErr = err.toString();
    if(chkErr.startsWith('Error: Transaction has been reverted by the EVM:')) {
      const errorObjectStr = err.message.slice(42)
      const errorObject = JSON.parse(errorObjectStr)
      let txHash = errorObject.transactionHash;
      try {
        const tx = await web3.eth.getTransaction(txHash);
        var result = await web3.eth.call(tx);
        result = result.startsWith('0x') ? result : `0x${result}`;
        if (result && result.substr(138)) {
          const reason = web3.utils.toAscii(result.substr(138))
          console.log('Revert reason:', reason)
          return reason;
        } else {
          console.log('Cannot get reason - No return value')
        }
      } catch(e) {
        var errMsg = e.toString();
        if(errMsg) {
          if(errMsg.startsWith('Error')) {
            var errObj = errMsg.slice(errMsg.indexOf("{"), errMsg.length);
            if(errObj.indexOf("{") != -1 &&  errObj.lastIndexOf("}")) {
              errObj = JSON.parse(errObj);
              return errObj.originalError.message;
            } else {
              return "Sorry, something went wrong please try again later.";
            }
          } else {
            console(errMsg);
            return "Sorry, something went wrong please try again later.";
          }
        } else {
            return "Sorry, something went wrong please try again later.";
        }
      }
      return "Sorry, something went wrong please try again later.";
    } else {
      return "Sorry, something went wrong please try again later.";
    }
  }
};