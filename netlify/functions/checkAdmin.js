exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);
  const adminEmails = process.env.ADMIN_EMAILS.split(',');

  return {
    statusCode: 200,
    body: JSON.stringify({
      isAdmin: adminEmails.includes(email)
    })
  };
};