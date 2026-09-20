const { BrevoClient } = require('@getbrevo/brevo')

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
})

const sendEmail = async ({
  to,
  subject,
  htmlContent
}) => {
  try {
    const response =
      await brevo.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent,
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: to
          }
        ]
      })

    console.log(
      'Brevo email sent:',
      response.messageId
    )

    return response
  } catch (error) {
    console.error(
      'Brevo email sending error:',
      error
    )

    throw error
  }
}

module.exports = {
  sendEmail
}