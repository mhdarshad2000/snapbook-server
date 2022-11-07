const nodemailer = require('nodemailer')

const {google} = require("googleapis")

const {OAuth2} = google.auth
const oauth_link = "https://developers.google.com/oauthplayground"
const {EMAIL,MAILING_ID,MAILING_REFRESH,MAILING_SECRET} = process.env

const auth = new OAuth2(
    MAILING_ID,
    MAILING_SECRET,
    MAILING_REFRESH,
    oauth_link)

    exports.sendVerificationEmail = (email,name,uri)=>{
        auth.setCredentials({
            refresh_token:MAILING_REFRESH
        })
        const accessToken = auth.getAccessToken()
        const stmp = nodemailer.createTransport({
            service:"gmail",
            auth:{
                type:"OAuth2",
                user:EMAIL,
                clientId:MAILING_ID,
                clientSecret:MAILING_SECRET,
                refreshToken:MAILING_REFRESH,
                accessToken
            }
        })
        const mailOptions = {
            from:EMAIL,
            to:email,
            subject:"SnapBook email verification",
            html:`<head><style> @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@500;600&display=swap'); </style></head><body> <div style="font-family: 'Josefin Sans', sans-serif; font-size: 50px;">snapbook <span style="color: #4c649b;font-size: 28px;">Action Required: <span style="font-size: 20px; ">Activate your snapbook account</span> </span></div> <div> <div style="font-family: Arial;"> <h3>Hello ${name} </h3> <p style="margin-bottom: 30px;">You recently created an account on snapbook.To complete the registration, Please confirm your account</p> <a style="width:200px; padding:10px 15px; background:#4c649b; color:white; text-decoration: none; font-weight: 600;" href=${uri}>Confirm your account</a> <hr style="margin-top: 20px;"> </div> </div></body>`
        }
        stmp.sendMail(mailOptions, (err,res)=>{
            if(err) return err

            return res
        })
    }