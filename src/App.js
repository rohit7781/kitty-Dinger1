import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect,checkPresaleUser } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import webimage from "./web-image.png";
import SocialFollow from "./SocialFollow";
import "./App.css";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Web3 from "web3";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

  
// Moralis.initialize("9lqvX9uIdweQxGIFjnmIA6s10h4DM4SfdBMDFt9M");
// Moralis.serverURL = "https://3dydnftciqp8.usemoralis.com:2053/server";

// const provider = new WalletConnectProvider({
// 	rpc: {
// 	  1: "https://mainnet.infura.io/v3/ba9f989627a147db94806086792b6409",
	 
// 	},
//   });

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
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
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
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
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  let connection = false;
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [isWhitelisted, setIsWhitelisted] = useState(true);
  const [preSaleTime, setPreSaleTime] = useState({
    startOnTime : 1645278392,
    currentTime : Math.floor(Date.now() / 1000)
  })

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "0x7c519FcEE8A7dfF42E3D6a32ea3320dc669e97fd",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 56,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 3000,
    WEI_COST: 1000000000000000,
    DISPLAY_COST: 0.001,
    GAS_LIMIT: 285000,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const checkIfWhitelisted = async () => {
    let result = blockchain.smartContract.methods.whitelisted(
      blockchain.account
    );
    setIsWhitelisted(result);
  };

  const claimNFTs = () => {
    checkIfWhitelisted();
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    if (!isWhitelisted) {
      alert("You are not whitelisted to mint NFTs.");
      return;
    }

    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
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

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };
//   const connector = new WalletConnect({
//     bridge: "https://bridge.walletconnect.org", // Required
//     qrcodeModal: QRCodeModal,
//   });
const provider = new WalletConnectProvider({
  rpc: {
    1: "https://mainnet.mycustomnode.com",
    3: "https://ropsten.mycustomnode.com",
    56: "https://bsc-dataseed.binance.org/",
    
  },
});
  
  const Walletconnection = async () => {
    await provider.disconnect()
    // if (!connector.connected) {
    //   // create new session
    //   connector.createSession();
    // }

    // connector.on("connect", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }
    // connection=true
    //   // Get provided accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    //    blockchain.account=accounts[0]
    // //   console.log("Blockchain")
    // //   console.log(blockchain.account)
    // //   console.log(accounts)
    // //   console.log(chainId)



      let cost = CONFIG.WEI_COST;
      let gasLimit = CONFIG.GAS_LIMIT;
      let totalCostWei = String(cost * 1);
      let totalGasLimit = String(gasLimit * 1);
    //   console.log("Cost: ", totalCostWei);
    //   console.log("Gas limit: ", totalGasLimit);
    //   setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
     // setClaimingNft(true);
     

    //   blockchain.smartContract.methods
    //    .mint(blockchain.account,1)
	//    .connector
    //   .signTransaction(tx).then((result) => {
    //     // Returns signed transaction
    //     console.log(result);
    //   })
    //   .catch((error) => {
    //     // Error returned when rejected
    //     console.error(error);
    //   });




    // });
	
	const abiResponse = await fetch("/config/abi.json", {
		headers: {
		  "Content-Type": "application/json",
		  Accept: "application/json",
		},
	  });
	  const abi = await abiResponse.json();
	
    try{
      await provider.enable();
      const web3 = new Web3(provider);
    }
    catch(err) {
     //log.console(err.message)
     await provider.disconnect()

    }


  provider.on("accountsChanged", (accounts: string[]) => {
    console.log(accounts);
  });

  provider.on("disconnect", (code: number, reason: string) => {
    console.log(code, reason);
    //await provider.disconnect()
  });
	
	const accounts = await web3.eth.getAccounts();
	const tx = {
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: accounts[0],
        value: totalCostWei,
		
      };
	console.log(blockchain.account)
	console.log(accounts)
	
	const NameContract = new web3.eth.Contract(abi, CONFIG.CONTRACT_ADDRESS);
	NameContract.methods.mint(accounts[0],1).send(tx);

  };
  

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
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
    
  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.jpg" : null}
      >
        <a href={CONFIG.MARKETPLACE_LINK}>
          <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        </a>
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >
              {/* <StyledButton
                onClick={(e) => {
                  window.open("theschrodinger.com", "_blank");
                

                }}
                style={{
                  margin: "5px",
                }}
              >
                Roadmap
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                }}
                onClick={(e) => {
                  window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                }}
              >
                {CONFIG.MARKETPLACE}
              </StyledButton> */}
            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
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
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    
                    <StyledButton
                     
                      onClick={(e) => {
                       e.preventDefault();
                        Walletconnection()
                        //  dispatch(connect());
                        //  getData();
                      }}
                    >
                      Wallet Connect
                    </StyledButton>
                    
                    {blockchain.errorMsg !== "" || blockchain.account!="" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
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
                           claimNFTs()
                          getData();
                        }}
                      >
                        {claimingNft && isWhitelisted ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
        <s.Container jc={"center"} ai={"center"} style={{ width: "80%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              textTransform: "uppercase",
              padding: "8px",
              fontSize: "50px",
              color: "var(--secondary)",
            }}
          >
            KittyDinger
          </s.TextDescription>

          <div>
            <div className="myImage"> </div>
          </div>

          <s.TextDescription
            style={{
              textAlign: "center",
              fontSize: "25px",
              color: "var(--primary-text)",
            }}
          >
            KittyDinger may look like a cute cat on the outside but behind the
            cute exterior lies a fearsome fighter
          </s.TextDescription>
          <s.TextDescription
            style={{
              textAlign: "center",
              textTransform: "uppercase",
              padding: "8px",
              fontSize: "50px",
              color: "var(--secondary)",
            }}
          >
            MINT $KITTIES
          </s.TextDescription>
          <s.TextDescription
            style={{
              textAlign: "left",
              fontSize: "25px",
              color: "var(--primary-text)",
            }}
          >
            By minting you will receive $KITTIES, which can be used in game for
            a variety of purposes.<br></br>- Choose the number of $KITTIES you
            wish to mint, then click on the mint button.<br></br>- A maximum of
            12 $KITTIES can be minted per wallet.<br></br>- There will be a total
            of 3000 $KITTIES available for minting.<br></br>
            Current price: 0.07 ETH + Gas Fee<br></br>
            <br></br>
            <SocialFollow />
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
