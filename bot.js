const ripple = require('ripple-lib')
const api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })
api.connect()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// const BigNumber = require('big-number')
bot.command('pay', (ctx) => {

    const inputs = ctx.message.text.split(' ')
    const payID = inputs[1]
    const amount = inputs[2] + "000000"
    const sender = "r4ggLgv8MpvcqqkGj86TQWnkSYVSYSxhQb" // Satya's address
    console.log(amount, typeof amount)

    // const dropsAmount = api.xrpToDrops(BigNumber(amount).val)
    api.prepareTransaction({
        "TransactionType": "Payment",
        "Account": sender,
        "Amount": amount, // Same as "Amount": "22000000"
        "Destination": "rMrudtZB5i2ks9rMMAMNS2cUixo8sfQyg1" // Shane's address
    }, {
        "maxLedgerVersionOffset": 75 // Expire this transaction if it doesn't execute within ~5 minutes:
    }).then((preparedTx) => {
        
        const { txJSON, instructions } = preparedTx
        const { maxLedgerVersion, fee } = instructions

        const txJSONstring = JSON.stringify(txJSON)
        console.log("Prepared transaction instructions:", txJSONstring)
        console.log("Transaction cost:", fee, "XRP")
        console.log("Transaction expires after ledger:", maxLedgerVersion)

        const sendersSecret = "sh9o5bCen9xRZ8cnqn8iYKffm2RDV" // Sathya's account secret
        const { id, signedTransaction } = api.sign(txJSONstring, sendersSecret)
        console.log("Identifying hash:", id)
        console.log("Signed blob:", signedTransaction)

        return api.submit(txBlob)
        
    }).then((result) => {

        const { resultCode, resultMessage } = result
        console.log("Tentative result code:", resultCode)
        console.log("Tentative result message:", resultMessage)

    })
    //     .catch((error) =>
    //     console.log("Error data:", error.data)
    // )
    
    // const latestLedgerVersion = (async () => await api.getLedgerVersion())()
    // console.log("Earliest ledger version:", latestLedgerVersion + 1)
    
    // api.on('ledger', ledger => {
    //     console.log("Ledger version", ledger.ledgerVersion, "was validated.")
    //     if (ledger.ledgerVersion > earliestLedgerVersion + 1) {
    //         ctx.reply("If the transaction hasn't succeeded by now, it's expired")
    //     }
    // })
    // // earliestLedgerVersion was noted when the transaction was submitted.
    // // txID was noted when the transaction was signed.
    // try {
    //     const tx = await api.getTransaction(txID, { minLedgerVersion: earliestLedgerVersion })
    //     ctx.reply("Transaction result:", tx.outcome.result)
    //     ctx.reply("Balance changes:", JSON.stringify(tx.outcome.balanceChanges))
    //     ctx.reply(`${payID}`)
    // } catch (error) {
    //     console.log("Couldn't get transaction outcome:", error)
    // }

})

bot.launch()