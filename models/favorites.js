var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]
}, {
    timestamps: true
});


module.exports = mongoose.model('Favorite', favoriteSchema);