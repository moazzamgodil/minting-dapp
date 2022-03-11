const initialState = {
  loading: false,
  totalSupply: 0,
  cost: 0,
  maxSupply: 0,
  maxMintAmount: 0,
  balanceOf: 0,
  nfts: [],
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        totalSupply: action.payload.totalSupply,
        cost: action.payload.cost,
        maxSupply: action.payload.maxSupply,
        maxMintAmount: action.payload.maxMintAmount,
        balanceOf: action.payload.balanceOf,
        nfts: action.payload.nfts,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
