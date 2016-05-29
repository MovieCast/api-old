import mongoose from 'mongoose';

export default mongoose.model('Movie', {
    _id: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    title: String,
    year: String,
    description: String,
    runtime: String,
    rating: {},
    images: {},
    country: String,
    genres: [],
    released: Number,
    trailer: String,
    certification: String,
    torrents: {}
});