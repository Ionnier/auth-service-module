const sequelize = require('./db')
const { Sequelize } = require("sequelize");

module.exports = async () => {
    const User = sequelize.define("user",
        {
            userName: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            userPassword: {
                type: Sequelize.STRING,
                allowNull: false
            },
            isImportant: {
                type: Sequelize.BOOLEAN, 
                defaultValue: false
            }
        },
        {
            timestamps: true
        },
    );

    await User.sync();

    return User;
};