import React, { useState } from "react"
import { Button } from "react-bootstrap"
import styles from "../styles/Home.module.css"
import UAuth from "@uauth/js"

const unstoppableauth = new UAuth({
    clientID: "a1ad10b9-eb4a-44a0-9f6c-2b4f87d8c523",
    redirectUri: "http://localhost:3000",
})

function UnstoppableDomain() {

    const [Uauth, setUauth] = useState();

    async function connectWallet() {
        try {
            const auth = await unstoppableauth.loginWithPopup()
            setUauth(JSON.parse(JSON.stringify(auth))["idToken"])

            await authenticate();
        } catch (error) {
            console.error(error);
        }
    }

    async function logOut() {
        unstoppableauth.logout()
        logout()
    }

    function log() {
        if (Uauth === null || Uauth === undefined) {
            connectWallet()
        } else {
            logOut()
        }
    }

    return (
        <>
            {/* <a className = {styles.navlink} onClick={log}>{Uauth != null ? Uauth["sub"] : "Login with UNSD"}</a> */}
            <Button onClick = {log} className={styles.button}>
                {Uauth != null ? Uauth["sub"] : "Login with UNSD"}
            </Button>
        </>
    )
}

export default UnstoppableDomain