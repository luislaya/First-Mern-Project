import express from 'express'
import RestaurantsCrtl from './restaurants.controller.js'
import ReviewsCrtl from './review.controller.js'

const router = express.Router()

router.route('/').get(RestaurantsCrtl.apiGetRestaurants)
router.route('/id/:id').get(RestaurantsCrtl.apiGetRestaurantsById)
router.route('/cuisines').get(RestaurantsCrtl.apiGetRestaurantsCuisine)

router
  .route('/review')
  .post(ReviewsCrtl.apiPostReview)
  .put(ReviewsCrtl.apiUpdateReview)
  .delete(ReviewsCrtl.apiDeleteReview)

export default router
