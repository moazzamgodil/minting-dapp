// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = (acc) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let totalSupply = await store
        .getState()
        .blockchain.smartContract.methods.totalSupply()
        .call();
        
      let cost = await store
        .getState()
        .blockchain.smartContract.methods.cost()
        .call();
        
      let maxSupply = await store
        .getState()
        .blockchain.smartContract.methods.maxSupply()
        .call();
        
      let maxMintAmount = await store
        .getState()
        .blockchain.smartContract.methods.maxMintAmount()
        .call();

      let balanceOf = 0;
      let nfts = [];
      if(acc) {
        balanceOf = await store
        .getState()
        .blockchain.smartContract.methods.balanceOf(acc)
        .call();
        
        let walletOfOwner = await store
        .getState()
        .blockchain.smartContract.methods.walletOfOwner(acc)
        .call();

        var i = 0;
        while(i<Number(balanceOf)) {

          let tokenURI = await store
          .getState()
          .blockchain.smartContract.methods.tokenURI(walletOfOwner[i])
          .call();
          if(tokenURI) {
            let tokenURIJson = tokenURI.substring(7, tokenURI.length);
            nfts.push(tokenURIJson);
          }
          i++;
        }

      }

      dispatch(
        fetchDataSuccess({
          totalSupply,
          cost,
          maxSupply,
          maxMintAmount,
          balanceOf,
          nfts,
        })
      );
    } catch (err) {
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};