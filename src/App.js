import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, getTotalSupply, getErrorMessage, updateAccount } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len, small = false) =>
  input.length > len ? `${input.substring(0, len)}...${small ? input.substring(input.length - len, input.length) : ''}` : input;

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  padding: 5px 20px;
  border-radius: 20px;
  border: none;
  background: var(--gradient);
  font-weight: 900;
  color: var(--secondary-text);
  font-size: 24px;
  @media (max-width: 767px) {
    font-size: 14px;
  }
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: #3280d3;
  padding: 20px;
  font-weight: bold;
  font-size: 24px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  @media (max-width: 767px) {
    font-size: 16px;
    padding: 10px;
  }
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
  @media (max-width: 767px) {
    padding-top: 0 !important;
  }
  @media (min-width: 768px) and (max-width: 1000px) {
    padding-top: 0 !important;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (max-width: 767px) {
    width: 150px;
    margin-bottom: 5px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
  z-index: 999;
`;

export const StyledImg = styled.img`
  position: absolute;
  left: calc(2vw);
  z-index: 998;
  bottom: 0;
  max-width: calc(40vw);
  max-height: 100%;
  @media (max-width: 767px) {
    position: relative;
    max-width: 250px;
    height: auto;
    left: 0;
  }
  @media (min-width: 768px) and (max-width: 1000px) {
    position: relative;
    left: 0;
    max-width: 300px;
    height: auto;
  }
  }
  @media (min-width: 1024px) and (max-width: 1200px) {
    max-width: 250px;
    height: auto;
  }
  transition: width 0.5s;
`;

export const NftImg = styled.img`
  max-width: calc((100vw / 4) - 50px);
  border: 2px solid #27a6dc;
  border-radius: 15px;
  background: #ffffff;
  margin: 0 10px 20px;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
  font-size: 24px;
  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

export const StyledTopDiv = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  @media (max-width: 767px) {
    flex-direction: column;
    // padding-bottom: 0;
  }
`;

export const StyledSocialLink = styled.a`
  margin-left: 20px;
  @media (max-width: 767px) {
    margin: 0 15px;
  }
`;

export const StyledSocialImg = styled.img`
  filter: invert();
  max-width: 60px;
  @media (max-width: 767px) {
    max-width: 40px;
  }
`;

export const StyledBlueText = styled.p`
  color: #27a6dc;
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
  text-align: center;
  @media (max-width: 767px) {
    font-size: 24px;
  }
`;
 
 export const StyledWhiteText = styled.h3`
  color: #ffffff;
  font-size: 80px;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  @media (max-width: 767px) {
    font-size: 40px;
  }
  `;
  
  export const StyledGoldenText = styled.p`
  color: #b58823;
  font-size: 24px;
  text-transform: uppercase;
  text-align: center;
  @media (max-width: 767px) {
    font-size: 20px;
  }
`;



function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [loggedIn, setloggedIn] = useState(false);
  const [nftObj, setnftObj] = useState([]); 
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: true,
    MAX_MINT_AMOUNT: 10
  });

  window.onload = () => {
    dispatch(getTotalSupply());
  }

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    console.log("Minting in progress...");
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", async (err) => {
        
        var errMsg = await getErrorMessage(err);
        setFeedback(errMsg);
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const disconnectWallet = async () => {
    if(blockchain.provider && blockchain.provider.isWalletConnect) {
      await blockchain.provider.disconnect();
    } else if(blockchain.provider && blockchain.provider.isCoinbaseWallet) {
      await blockchain.provider.close();
    } else {
      blockchain.provider = '';
      setloggedIn(false);
      return (dispatch) => {
        dispatch(updateAccount(""));
      }
    }
    blockchain.provider.on("disconnect", () => {
      blockchain.provider = '';
      setloggedIn(false);
      return (dispatch) => {
        dispatch(updateAccount(""));
      }
    });
  }

  if(blockchain.provider) {
    blockchain.provider.on("chainChanged", () => {
      window.location.reload();
    });
  }

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > (data.maxMintAmount ? data.maxMintAmount : CONFIG.MAX_MINT_AMOUNT)) {
      newMintAmount = (data.maxMintAmount ? data.maxMintAmount : CONFIG.MAX_MINT_AMOUNT);
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      setloggedIn(true);
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    getNFTs();
  }, [data.nfts]);

  const getNFTs = async () => {
    let nftObj = [];
    const nfts = await data.nfts;
    if(nfts.length > 0) {
      let i;
      for(i=0; i<nfts.length; i++) {

        const nftResponse = await fetch(`https://mygateway.mypinata.cloud/ipfs/${nfts[i]}`, {
          headers: {
            Accept: "application/json",
          },
        });
        const nft = await nftResponse.json();
        const nftImg = `https://mygateway.mypinata.cloud/ipfs/${nft.image.substring(7, nft.image.length)}`;
        nftObj[i] = nftImg;
      }
    }
    setnftObj(nftObj);
  }

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ backgroundColor: "var(--primary)", /*minHeight: "100vh"*/ }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledTopDiv>
        <a target={'_blank'} href="https://www.metajewelz.com/" style={{zIndex: '999'}}>
          <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
          </a><div>
            <StyledSocialLink target={'_blank'} href="https://twitter.com/"><StyledSocialImg src="/config/images/twitter.png" alt="Discord" /></StyledSocialLink>
            <StyledSocialLink target={'_blank'} href="https://www.instagram.com/"><StyledSocialImg src="/config/images/instagram.png" alt="Discord" /></StyledSocialLink>
            <StyledSocialLink target={'_blank'} href="https://discord.gg/"><StyledSocialImg src="/config/images/discord.png" alt="Discord" /></StyledSocialLink>
          </div>
        </StyledTopDiv>

        <StyledImg alt={"meta"} src={"/config/images/meta.png"} />

        <ResponsiveWrapper flex={1} style={{ padding: 24, flex: 1 }} test>
          <s.SpacerLarge display={"none"} />
          <s.Container
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: 30,
              borderRadius: 24,
              flex: "initial",
              margin: "30px",
              height: "100%"
            }}
            className="maincontainer"
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {(data.maxSupply ? data.maxSupply : CONFIG.MAX_SUPPLY)}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK} style={{fontSize: 18, wordBreak: "break-all"}}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= (data.maxSupply ? Number(data.maxSupply) : CONFIG.MAX_SUPPLY) ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                {!loggedIn ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <div style={{ display: 'flex', flexDirection: 'column', width: "100%", maxWidth: "400px" }}>
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect('metamask'));
                        getData();
                      }}
                    >
                      METAMASK
                      <img style={{width: 40, marginLeft: "auto"}} src={"/config/images/metamask.png"} />
                    </StyledButton>
                    <StyledButton
                      style={{ marginTop: '10px'}}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect('walletconnect'));
                        getData();
                      }}
                    >
                      WALLETCONNECT
                      <img style={{width: 40, marginLeft: "auto"}} src={"/config/images/walletconnect.png"} />
                    </StyledButton>
                    <StyledButton
                      style={{ marginTop: '10px'}}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect('coinbase'));
                        getData();
                      }}
                    >
                      COINBASE
                      <img style={{width: 40, marginLeft: "auto"}} src={"/config/images/coinbase.png"} />
                    </StyledButton>
                    </div>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription2
                          style={{
                            textAlign: "center",
                            color: "red",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription2>
                      </>
                    ) : null}
                  </s.Container>
                ) : !data.loading ? (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                        wordBreak: "break-word",
                        width: "50%",
                        fontSize: "24px"
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "MINTING" : "BUY"}
                      </StyledButton>
                    </s.Container>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                      style={{fontSize: "18px"}}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          disconnectWallet();
                        }}
                      >
                        Disconnect Wallet
                      </StyledButton>
                    </s.Container>
                  </>
                ) : <s.TextDescription
                style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                  wordBreak: "break-word",
                  width: "50%",
                  fontSize: "24px"
                }}
              >
                Connecting to Wallet
              </s.TextDescription>}
                <s.SpacerLarge />
                {/* <s.SpacerSmall /> */}
                <s.TextTitleMintPrice
                  style={{ textAlign: "center", color: "var(--accent-text)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "2px" }}
                >
                  MINT PRICE: {data.cost ? (Number(data.cost) / 10**18) : CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitleMintPrice>
                <s.SpacerXSmall />
                <s.TextDescription2
                  style={{ textAlign: "center", color: "var(--accent-text)", textTransform: "uppercase", fontWeight: "normal" }}
                >
                  Excluding gas fees.
                </s.TextDescription2>
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>
      </s.Container>
      <s.Container style={{ padding: "60px", justifyContent: "center", alignItems: "center" }}>
          {data.loading && loggedIn ? (<StyledGoldenText>Loading your NFTs</StyledGoldenText>)
          : (
            loggedIn ? (
              data.balanceOf > 0 ? (
                nftObj.length > 0 ? (
                  <>
                    <StyledBlueText>NFTs against your wallet ({truncate(blockchain.account, 5, true)})</StyledBlueText>
                    <br/>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                      {
                        nftObj.map((nft, i) => (
                          <NftImg key={i} src={nft}/>
                        ))
                      }
                    </div>
                  </>
                ) : (<StyledGoldenText>Loading your NFTs</StyledGoldenText>)
              ) : (<StyledBlueText>No NFT found</StyledBlueText>)
            ) : (<StyledBlueText>Connect your account to see your NFTs</StyledBlueText>)
          )}

        {/* <StyledWhiteText>Minting Now</StyledWhiteText>
        <StyledGoldenText>Regular website content will be back after mint!</StyledGoldenText> */}
      </s.Container>
    </s.Screen>
  );
}

export default App;
