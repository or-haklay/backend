const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Apartment}  = require('../models/Apartment');
const { User } = require('../models/User');

async function connectUserToApartment(req, res) {
    try{
        //request validation
        const { apartmentId } = req.params;
        if(!apartmentId) return res.status(400).json({ error: 'Apartment ID is required' });

        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if(!decoded) return res.status(401).json({ error: 'Invalid token' });
        const userId = decoded.userId;
        //system validation
        const apartment = await Apartment.findById(apartmentId);
        if(!apartment) return res.status(404).json({ error: 'Apartment not found' });

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: 'User not found' });

        if(user.apartmentId) return res.status(400).json({ error: 'User already connected to an apartment' });
        if(apartment.members.includes(userId)) return res.status(400).json({ error: 'User already in the apartment' });
        
        //process
        user.apartmentId = apartmentId;
        await user.save(); 
        apartment.members.push(userId);
        await apartment.save();
        
        //response
        return res.status(200).json({ message: 'User connected to apartment successfully', apartment: apartment, user: user });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    connectUserToApartment,
};