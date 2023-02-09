import app from './server.js'
import mongodb from 'mongodb'
import dotenv from 'dotenv'
import RestaurantsDAO from './dao/restaurantsDAO.js'
import ReviewsDAO from './dao/reviewDAO.js'

dotenv.config()

const MongoClient = mongodb.MongoClient

const port = process.env.PORT || 8000

MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  writeConcern: { poolSize: 50 },
  writeConcern: { wtimeout: 2500 },
  writeConcern: { useNewUrlParse: true }, //writeconcern to avoid any node errors
})
  .catch((err) => {
    console.log(err.stack)
    process.exit(1)
  })
  .then(async (client) => {
    await RestaurantsDAO.injectDB(client)
    await ReviewsDAO.injectDB(client) //always add this when you are injectingDB
    app.listen(port, () => {
      console.log(`listening on port ${port}`)
    })
  })
