const ripple = require('ripple-lib')
const api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })
api.connect()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// const BigNumber = require('big-number')
bot.command('pay', (ctx) => {

    const inputs = ctx.message.text.split(' ')
    const payID = inputs[1]
    const amount = inputs[2] //+ "000000"
    const sender = "r4ggLgv8MpvcqqkGj86TQWnkSYVSYSxhQb" // Satya's address
    console.log(amount, typeof amount)

    // const dropsAmount = api.xrpToDrops(BigNumber(amount).val)
    return api.preparePayment("r4ggLgv8MpvcqqkGj86TQWnkSYVSYSxhQb",{
        "source": {
            "address": "r4ggLgv8MpvcqqkGj86TQWnkSYVSYSxhQb",
            "maxAmount": {
                "value": "1.000000",
                "currency": "XRP"
            } // Sathya's address
        },
        "destination": {
            "address": "rMrudtZB5i2ks9rMMAMNS2cUixo8sfQyg1",
            "amount": {
                "value": "1.000000",
                "currency": "XRP"
            } // Shane's address
        }
    }).then((preparedTx) => {
        
        const { txJSON, instructions } = preparedTx
        const { maxLedgerVersion, fee } = instructions

        console.log("txJSON:", txJSON)
        console.log("Transaction cost:", fee, "XRP")
        console.log("Transaction expires after ledger:", maxLedgerVersion)

        const sendersSecret = "sh9o5bCen9xRZ8cnqn8iYKffm2RDV" // Sathya's account secret
        const { id, signedTransaction } = api.sign(txJSON, sendersSecret)
        console.log("Identifying hash:", id)
        console.log("Signed blob:", signedTransaction)

        return api.submit(signedTransaction)
        
    }).then((result) => {

        const { resultCode, resultMessage } = result
        console.log("resultCode:", resultCode)
        console.log("resultMessage:", resultMessage)

        return api.getLedgerVersion()

    }).then((latestLedgerVersion) => {
        console.log("Earliest ledger version:", latestLedgerVersion + 1)

    })
        .catch((error) =>
        console.log("Error data:", error.data)
    )


    // api.on('ledger', ledger => {
    //     console.log("Ledger version", ledger.ledgerVersion, "was validated.")
    //     if (ledger.ledgerVersion > latestLedgerVersion + 1) {
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