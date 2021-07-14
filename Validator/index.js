exports.userSignupValidator = (req,res,next) =>{
    req.check('name', 'Name is Required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
        .withMessage('Invalid Email Format')
        .isLength({
            min:4, max:32
    });
    req.check('password', 'Password is Required').notEmpty();
    req.check('password')
        .isLength({min:8})
        .withMessage('password must be minimum 8 characters long')
        .matches(/(?=.*[0-9])/)
        .withMessage("password must contain atleast one number")
        .matches(/(?=.*[A-Z])/)
        .withMessage("password must contain atleast one Capital letter")
        .matches(/(?=.*[!@#$%^&*])/)
        .withMessage("password must contain atleast one special character");
    req.check('dateOfBirth', 'Date of Birth is Required').notEmpty();
    req.check('dateOfBirth')
        .matches(/^\d{2}([./-])\d{2}\1\d{4}$/)
        .withMessage("Date of Birth Format is Invalid");

    const errors = req.validationErrors()
    if(errors){
        const firstError = errors.map(error=>error.msg)[0]
        return res.status(400).json({error: firstError});
    }
    next();
}