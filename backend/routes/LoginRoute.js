var express = require('express');
const auth = require('../middleware/auth');
var router = express.Router();
const user = require('../models/user');
const jwtSecret = "my secret token";
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator/check'); 
const bcrypt = require('bcryptjs');


//Post request to api/auth
//Authenticate user and get token
//Public

router.post('/',[ 
    check('email', 'Please include a proper email').isEmail(), 
    check('password', 'Password is required').exists()
], async (req, res) =>{
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return(res.status(400).json({errors: errors.array() }));
    }


    const {email, password} = req.body;

    try{
        
    // See if user exists
        let User = await user.findOne({email});

        if(!User){
            return res.status(400).json({ errors: [{msg: 'Invalid credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, User.password);

        if(!isMatch){
            return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] })
        }
    
        //Return json webtoken
    
    const payload ={
        User: {
            id: User.id,
        }
    }

    await jwt.sign(payload,jwtSecret,
    {expiresIn: 360000},//optional
    (err, token)=>{
        if(err){
            throw err;
        }else{
            console.log("mypayloadid" + payload.User.id);
            res.send({"token":token,"userid":payload.User.id});

        }
    });

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

module.exports = router;