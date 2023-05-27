const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
const fileUpload = require('express-fileupload')
const pdfParse = require('pdf-parse')
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());


const port = 3080

app.post('/', async (req, res) => {
    const {message, currentModel} = req.body;

    const response = await openai.createCompletion({
        model: `${currentModel}`,
        prompt: `${message}`,
        max_tokens: 1000,
        temperature: 0.2,
    });
    res.json({
        message: response.data.choices[0].text,
    })
})

app.get('/models', async (req, res) => {
    const response = await openai.listEngines();
    res.json({
        models: response.data.data
    })
})

app.post('/extract-text', (req, res) => {
    if (!req.files && !req.files.pdfFile) {
        res.status(400);
        res.end();
    }

    pdfParse(req.files.pdfFile).then(result => {
        res.send(result.text);
    })
})


app.listen(port, () => {
    console.log(`Example app listening at port ${port}`)
});