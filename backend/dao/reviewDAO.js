import mongodb from 'mongodb'
const ObjectId = mongodb.ObjectId

let reviews

export default class ReviewsDAO {
  static async injectDB(conn) {
    if (reviews) {
      return
    }
    try {
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection('reviews')
    } catch (e) {
      console.error(`Unable to establish collection hanfles in userDAO ${e}`)
    }
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        restaurant_id: ObjectId(restaurantId), // restaurantid is converted to an object id
      }

      return await reviews.insertOne(reviewDoc) //insert the doc to the database
    } catch (e) {
      console.error(`Unable to post review: ${e}`)

      return { error: e }
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        { user_id: userId, _id: ObjectId(reviewId) }, // we are looking for the user_id and the review id here
        { $set: { text: text, date: date } } // this is where we set the date and the review
      )

      return updateResponse
    } catch (e) {
      console.error(`Unable to update review: ${e}`)

      return { error: e }
    }
  }

  static async deleteReview(reviewId, userId, text, date) {
    try {
      const deleteResponse = await reviews.deleteOne(
        { user_id: userId, _id: ObjectId(reviewId) } // we are looking for the user_id and the review id here
      )

      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete review: ${e}`)

      return { error: e }
    }
  }
}
