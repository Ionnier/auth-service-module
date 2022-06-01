require('dotenv').config()
const express = require('express')
const { body, validationResult } = require('express-validator');
const User = require('./database/User')
const authUtils = require('./utils/authUtils')
const EventBus = require('./EventBus')

const app = express()
const cors = require('cors')

app.use(cors())

app.post('/login', 
    express.json(),
    body('username').isLength({min: 3}),
    body('password').isLength({min: 3}),
    async (req, res, next) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const msg = getMessageFromArray(errors.array())
            return next(new Error(msg))
        }
        const user = await User() 
        const dbUser = await user.findOne({
            where:{userName: req.body.username}
        })
        if (!dbUser){
            return next(new Error('No such user'))
        }
        const result = await (authUtils.comparePassword(req.body.password, dbUser.userPassword))
        if( result == false ){
            return next(new Error('No such user'))
        }
        const token = authUtils.signToken(dbUser.dataValues)   
        res.status(200).json({token, user: dbUser}) 
        await EventBus.sendEvent(process.env.EXCHANGE_NAME || 'asdf', EventBus.createEvent("USER_LOGGED_IN", JSON.stringify(dbUser.dataValues)))
    }
)

app.post('/signup', 
    express.json(),
    body('username').isLength({min: 3}),
    body('password').isLength({min: 3}),
    async (req, res, next) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const msg = getMessageFromArray(errors.array())
            return next(new Error(msg))
        }
        const userPassword = await authUtils.generatePassword(req.body.password)
        const user = await User()
        try{
            let isImportant = req.body.username.includes('admin')
            const newUser = await user.create({userName: req.body.username, userPassword, isImportant})
            const token = authUtils.signToken(newUser.dataValues)   
            res.status(200).json({token, user: newUser})
            await EventBus.sendEvent(process.env.EXCHANGE_NAME || 'asdf', EventBus.createEvent("USER_SIGNED_UP", JSON.stringify(newUser.dataValues)))
        } catch(e){
            return next(e)
        }
    }
)

function getMessageFromArray(array){
    return array.reduce((previousValue, currentValue) => {
        return previousValue += `${currentValue.msg}: ${currentValue.param}\n`
        }, ""
    );
}

app.use('*', (err, req, res, next) => {
    res.status(418).json({error: err.message})
})

const port = process.env.PORT || 3000 
app.listen(port, () => {
    console.log(`App listening on ${port}.`)
})