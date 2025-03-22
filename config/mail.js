import nodemailer from 'nodemailer';

export const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: 'manishkirthalya@gmail.com', pass: 'yuqm qetv ewix aznt' },
    });

    await transporter.sendMail({
        from: 'manishkirthalya@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
    });
};
