import RestaurantsDAO from '../dao/restaurantsDAO.js'

export default class RestaurantController {
  static async apiGetRestaurants(req, res, next) {
    const restaurantsPerPage = req.query.restaurantsPerPage
      ? parseInt(req.query.restauranstPerPage, 10)
      : 20 //if the req.query.restaurantPerPage convert it into an int else return 20
    const page = req.query.page ? parseInt(req.query.page, 10) : 0

    let filters = {}

    if (req.query.cuisine) {
      filters.cuisine = req.query.cuisine //if cuisine is in the query set it to cuisine
    } else if (req.query.zipcode) {
      filters.zipcode = req.query.zipcode //if zipcode is in the query set it to zipcode
    } else if (req.query.name) {
      filters.name = req.query.name //if name is in the query set it to name
    }

    const { restaurantsList, totalNumRestaurants } =
      await RestaurantsDAO.getRestaurants({
        // the method we created in RestaurantsDAO
        filters,
        page,
        restaurantsPerPage,
      })

    let response = {
      //this is what we respond when the uri is called
      restaurants: restaurantsList,
      page: page,
      filters: filters,
      entries_per_page: restaurantsPerPage,
      total_results: totalNumRestaurants,
    }

    res.json(response)
  }

  static async apiGetRestaurantsById(req, res, next) {
    try {
      let id = req.params.id || {}
      let restaurant = await RestaurantsDAO.getRestaurantsByID(id)

      if (!restaurant) {
        res.status(404).json({ error: 'Not found' })
        return
      }

      res.json(restaurant)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async apiGetRestaurantsCuisine(req, res, next) {
    try {
      let cuisines = await RestaurantsDAO.getCuisine()
      res.json(cuisines)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }
}
