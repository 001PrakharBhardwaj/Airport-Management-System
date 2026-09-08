import 'dotenv/config'
import app from './app.js'

const port = Number.parseInt(process.env.PORT, 10) || 4000

app.listen(port, () => {
  console.log(`AEROVAULT API listening on http://localhost:${port}`)
})
