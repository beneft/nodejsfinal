const mongoose = require('mongoose');

const pageItemSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: true
    },
    title: {
        type: {
            en: String,
            ru: String
        },
        required: true
    },
    description: {
        type: {
            en: String,
            ru: String
        },
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PageItem = mongoose.model('PageItem', pageItemSchema);

module.exports = PageItem;