import abi from "./utils/CoffeeByWallet.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import styles from "./styles/Home.module.css";
import pfp from './utils/aditya.jpg'
import UnstoppableDomain from "./components/UnstoppableLogin";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x6710ffB5f4D4250533bfc4260eb5dfA573f594A4";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const coffeeByWallet = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..");
        const coffeeTxn = await coffeeByWallet.BuyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getGifts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeeByWallet = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await coffeeByWallet.getGifts();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let coffeeByWallet;
    isWalletConnected();
    getGifts();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, name, message, timestamp) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      coffeeByWallet = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      coffeeByWallet.on("buyCoffee", onNewMemo);
    }

    return () => {
      if (coffeeByWallet) {
        coffeeByWallet.off("buyCoffee", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <title>Buy Aditya a Coffee!</title>
      <meta name="description" content="Tipping site" />
      <link rel="icon" href="/favicon.ico" />

      <main className={styles.main}>
        <h2 className={styles.title}>Buy Aditya a Coffee!</h2>
        <img className={styles.pfp} src={pfp} />
        {currentAccount ? (
          <div className={styles.form}>
            <form>
              <div>
                <label>Name</label>
                <br />

                <input
                className={styles.name}
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>Send Aditya a message</label>
                <br />

                <textarea 
                className={styles.textarea}
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button className={styles.connect} type="button" onClick={buyCoffee}>
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
            <UnstoppableDomain />
        )}
      </main>

      {currentAccount && <h1>Gifts received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "2px solid",
                borderRadius: "5px",
                padding: "5px",
                margin: "5px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>"{memo.message}"</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}

      <footer className={styles.footer}>Created with 💖by Aditya</footer>
    </div>
  );
}