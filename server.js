const express = require('express')
const app = express()

const FormData = require('form-data')

const fs = require('fs')
const video = fs.createReadStream('./video/consent.mp4')

const { v4: uuidv4 } = require('uuid')

const axios = require('axios')

app.get('/sendVideo', (req, res) => {

	let bodyFormData = new FormData()
	bodyFormData.append('video', video)
	console.log(video)
	axios({
		method: 'post',
		url: 'https://api.telegram.org/bot1257527765:AAEZox5fcEk3eZPtgtqdb8XeWxqfUVE4WHM/sendVideo?chat_id=475202813',
		data: bodyFormData,
		headers: bodyFormData.getHeaders()
		// headers: { 'Content-Type': 'multipart/form-data' }
	})
		.then(console.log)
		.catch(console.log)

	return res.send('Consent request sent')
})

app.get('/linkToFHIR', async (req, res) => {

	let FHIR_resource = {
		"identifier": [
			{
				"system": "http://hl7.org/fhir/sid/icd-10-cm",
				"use": "usual",
				"assigner": {
					"display": "World Health Organization (WHO)"
				},
				"value": "Z0389"
			}
		],
		"extension": [
			{
				"extension": [
					{
						"valueString": "Z03",
						"url": "categoryCode"
					},
					{
						"valueString": "89",
						"url": "diagnosisCode"
					},
					{
						"valueString": "Z0389",
						"url": "fullCode"
					},
					{
						"valueString": "Encntr for obs for oth suspected diseases and cond ruled out",
						"url": "abbreviatedDescription"
					},
					{
						"valueString": "Encounter for observation for other suspected diseases and conditions ruled out",
						"url": "fullDescription"
					},
					{
						"valueString": "Encntr for medical obs for susp diseases and cond ruled out",
						"url": "categoryTitle"
					},
					{
						"valueString": "billable",
						"url": "billable"
					}
				],
				"url": "https://1up.health/dev/fhir/doc/extension/DataTypeCoding/icd"
			}
		],
		"code": "Z0389",
		"system": "http://hl7.org/fhir/sid/icd-10-cm",
		"display": "Z0389,Encntr for obs for oth suspected diseases and cond ruled out",
		"id": "icd10Z0389",
		"version": "2016",
		"resourceType": "DataTypeCoding"
	}

	const url = `http://payid.trade:4000/encounter`
	const permission = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InRlZWIifQ.0_SRPmiEqwp6ZIrAnfGCgbV-aSrRordbIyEnZ-dZG70'
	const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${permission}` }
	const id = `${uuidv4()}`
	const data = FHIR_resource ? JSON.stringify({ id, txid: `${Date.now()}`, status: "created", resource: FHIR_resource }) : null
	const options = { method: "POST", url, headers, data }
	FHIRServer_response = await axios(options)
		.then(console.log)
		.catch(console.log)

	return res.send('Added to FHIR Server')
})

app.listen(5000, () =>
	console.log(`Server listening on port 5000!`),
)