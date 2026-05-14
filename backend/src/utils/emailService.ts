interface RegistrationEmailInput {
  toEmail: string;
  studentName: string;
  eventName: string;
  registrationId: string;
  eventDate: Date;
  venue?: string;
  paymentStatus: string;
}

export const sendRegistrationEmail = async (input: RegistrationEmailInput) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured. Skipping registration email.');
    return { sent: false, reason: 'EmailJS is not configured' };
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: input.toEmail,
        student_name: input.studentName,
        event_name: input.eventName,
        registration_id: input.registrationId,
        event_date: input.eventDate.toLocaleString('en-IN'),
        venue: input.venue || 'Online',
        payment_status: input.paymentStatus,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.warn(`EmailJS send failed: ${message}`);
    return { sent: false, reason: message };
  }

  return { sent: true };
};
