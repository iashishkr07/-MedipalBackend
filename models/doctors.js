import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  degree: String,
  about: String,
  fees: String,
  speciality: String,
  experience: String,
  address: {
    street: String,
    city: String,
  },
  image: String,
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
