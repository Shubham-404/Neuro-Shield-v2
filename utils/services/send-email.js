const transporter = require('../../config/nodemailer')

module.exports = sendEmailToUser = async (mailOptions) => {
    try {
        let emailResponse = await transporter.sendMail(mailOptions);
        // console.log(emailResponse) 
        return {"message": "Email sent successfully", emailResponse}
        
    } catch (err) {
        return {"message": `Error sending email: ${err}`}
    } 
}