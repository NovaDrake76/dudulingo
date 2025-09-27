import express from 'express'

const PORT = 8080
const app = express()

app.get('/', (req, res) => {
  res.send('Alexa, ligar barulho de chuva')
})

app.listen(PORT, () => {
  console.log(`listening to Baroes da Pisadinha on port: ${PORT}`)
})
