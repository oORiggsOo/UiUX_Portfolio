const express = require('express');
const path = require('path')
const app = express();

// setup static and middlweware
app.use(express.static('./dist'))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname,'./dist/index.html'))
// adding to static assets
// SSR
})

app.all('*', (req, res) => {
  res.status(404).send('resource not found')
})

app.listen(5000, () => {
  console.log('server is listening on port 5000...')
})