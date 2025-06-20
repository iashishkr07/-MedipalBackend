import jwt from 'jsonwebtoken';

const authAdmin = async(req,res,next)=>{
  try {
    const token = req.headers
    if(!token){
      return res.json({success:false, message:'Unauthorized Login Again'})
    }
    const token_decode=jwt.verify(token, process.env.JWT_SECERT)

    if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
      return res.json({success:false, message:'Unauthorized Login Again'})
    }

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
}

export default authAdmin;
