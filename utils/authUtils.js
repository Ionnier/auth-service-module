const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
const jwt = require('jsonwebtoken')

exports.signToken = user => {
    return jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: 30 * 60 * 1000
    });
};

exports.generatePassword = async (plainPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err)
                reject(err)
            bcrypt.hash(plainPassword, salt, (err, hash) => {
                if (err)
                    reject(err)
                resolve(hash)
            });
        });
    })
}

exports.comparePassword = async (plainPassword, hashedPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
            if (err)
                reject(err)
            resolve(result)
        });
    })
}