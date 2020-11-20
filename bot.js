require('dotenv').config({
	path: './.env.local'
})

const bot_token = process.env.BOT_TOKEN

const { Telegraf } = require('telegraf')
const tgf_API = new Telegraf(bot_token)

const Telegram = require('telegraf/telegram')
const tgm_API = new Telegram(bot_token)

const { Keyboard } = require('telegram-keyboard')

const ripple = require('ripple-lib')
const api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })

api.connect()

let count = 0
const questions_and_answers = [
	['What is your housing situation today?', [
		'I have housing',
		'I do not have housing (staying with others, in a hotel, on the street, in a shelter)']
	],
	['What is the highest level of school that you have finished ?', [
		'Less than high school degree',
		'High school diploma or GED',
		'More than high school']
	],
	['What is your current work situation?', [
		'I have housing',
		'I do not have housing (staying with others, in a hotel, on the street, in a shelter)']
	],
	['What is your housing situation today?', [
		'I have housing',
		'I do not have housing (staying with others, in a hotel, on the street, in a shelter)']
	],
]

tgf_API.command('start', async (context) => {
	try {

	}
	catch (e) { console.log(e); }
})

tgf_API.command('', async (context) => {
	try {

	}
	catch (e) { console.log(e); }
})

tgf_API.command('consent', async (context) => {
	try {

		console.log(context.chat)
		// const updates = await tgm_API.getUpdates()
		const chat_id = context.chat.id
		tgm_API.sendVideo(chat_id, 'https://www.youtube.com/watch?v=TmodQMGITZw&random=58')
		const keyboard = Keyboard.make([
			['Yes', 'No'], // First row
			// ['Button 3', 'Button 4'], // Second row
		])

		await context.reply('Do you consent Dr. Dolittle to look at your EHR?', keyboard.reply())
		// await reply('Simple inline keyboard', keyboard.inline())
	}
	catch (e) {console.log(e);}
})

tgf_API.command('pay', (ctx) => {

    const inputs = ctx.message.text.split(' ')
    const payID = inputs[1]
    const amount = inputs[2] //+ "000000"
    const sender = "r4ggLgv8MpvcqqkGj86TQWnkSYVSYSxhQb" // Satya's address
    console.log(amount, typeof amount)

    let txID
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
        ctx.reply("txID:" + id)
        console.log("txID:", id)
        console.log("signedTransaction:", signedTransaction)

        return api.submit(signedTransaction)

    }).then((result) => {

        const { resultCode, resultMessage } = result
        console.log("resultCode:", resultCode)
        console.log("resultMessage:", resultMessage)

    }).catch(console.log)


    // api.on('ledger', ledger => {
    //     console.log("Ledger version", ledger.ledgerVersion, "was validated.")
    //     if (ledger.ledgerVersion > latestLedgerVersion + 1) {
    //         ctx.reply("If the transaction hasn't succeeded by now, it's expired")
    //     }
    // })

})

tgf_API.command('check', (ctx) => {

    const inputs = ctx.message.text.split(' ')
    const txID = inputs[1]
    api.getLedgerVersion().then((latestLedgerVersion) => {

        const earliestLedgerVersion = latestLedgerVersion + 1
        console.log("Earliest ledger version:", earliestLedgerVersion)

        // earliestLedgerVersion was noted when the transaction was submitted.
        // txID was noted when the transaction was signed.
        return api.getTransaction(txID, { minLedgerVersion: earliestLedgerVersion })

    }).then((tx) => {

        ctx.reply("Transaction result:", tx.outcome.result)
        ctx.reply("Balance changes:", JSON.stringify(tx.outcome.balanceChanges))
        ctx.reply(`${payID}`)

    })
        .catch(console.log)
})

tgf_API.launch()
