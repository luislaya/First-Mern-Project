import mongodb from 'mongodb'
const ObjectID = mongodb.ObjectId

let restaurants

export default class RestaurantsDAO {
  static async injectDB(conn) {
    if (restaurants) {
      return
    }
    try {
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection('restaurants') // connecting to the database
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e} `
      )
    }
  }

  static async getRestaurants({
    filters = null, //to filter what restaurant you want
    page = 0, // page number
    restaurantsPerPage = 20, // gives you 20 restaurants per page
  } = {}) {
    let query
    if (filters) {
      if ('name' in filters) {
        query = { $text: { $search: filters['name'] } } // this means a text search for a certain name but you have to create an index in mongodb
      } else if ('cuisine' in filters) {
        query = { cuisine: { $eq: filters['cuisine'] } } //this means if cuisine equals to the cuisine that was passed in
      } else if ('zipcode' in filters) {
        query = { 'address.zipcode': { $eq: filters['zipcode'] } }
      }
    }
    let cursor

    try {
      cursor = await restaurants.find(query) //finds all the restaurants that go along with the query
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }

    const diplayCursor = cursor
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page) // if thers no error we are going to limit the results and skip the page here

    try {
      const restaurantsList = await diplayCursor.toArray()
      const totalNumRestaurants = await restaurants.countDocuments(query)
      return { restaurantsList, totalNumRestaurants }
    } catch (e) {
      console.error(
        `Unable to convert cusor to array or problem counting documents, ${e}`
      )
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }
  }

  static async getRestaurantsByID(id) {
    try {
      const pipeline = [
        // pipline helps match different collection together
        {
          $match: {
            _id: new ObjectID(id),
          },
        },
        {
          $lookup: {
            // this is a data aggregation
            from: 'reviews',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$restaurant_id', '$$id'], // match the restaurant id
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: 'reviews', // match restaurant id and set it as reviews
          },
        },
        {
          $addFields: {
            reviews: '$reviews', //add reviews as a field too
          },
        },
      ]
      return await restaurants.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`)
      throw e
    }
  }
  static async getCuisine() {
    let cuisines = []

    try {
      cuisines = await restaurants.distinct('cuisine')
      return cuisines
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`)
      return cuisines
    }
  }
}
