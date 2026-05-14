const sendJwtToClient=(user,res)=>{
     user.role="kullanici";
    console.log(user.role);
    const token = user.generateJwtFromUser();

    const{JWT_COOKIE,NODE_ENV}=process.env;

    return res
    .status(200)
    .cookie("access_token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + parseInt(JWT_COOKIE)*1000),
        secure:NODE_ENV==="development" ? false : true
    })
    .json({
        success:true,
        access_token:token,
        data:{
            ad_soyad:user.ad_soyad,
            eposta:user.eposta
        }
    })
}
const sendJwtforKlinik=(klinik,res)=>{
    klinik.role="klinik";
    const token = klinik.generateJwtFromKlinik();

    const{JWT_COOKIE,NODE_ENV}=process.env;

    return res
    .status(200)
    .cookie("access_token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + parseInt(JWT_COOKIE)*1000),
        secure:NODE_ENV==="development" ? false : true
    })
    .json({
        success:true,
        access_token:token,
        data:{
            ad_soyad:klinik.ad_soyad,
            eposta:klinik.eposta
        }
    })
}

const isTokenIncluded=req=>{
    return(
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    );
};
const getAccessTokenFromHeader=(req)=>{
    const authorization=req.headers.authorization;
    const access_token=authorization.split(" ")[1];
    console.log(access_token);
    return access_token;
}


module.exports={
    sendJwtToClient,
    sendJwtforKlinik,
    isTokenIncluded,
    getAccessTokenFromHeader
};