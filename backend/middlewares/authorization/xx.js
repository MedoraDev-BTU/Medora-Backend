const jwt = require("jsonwebtoken");
const {getAccessTokenFromHeader,isTokenIncluded}=require('./tokenhelpers')

const getAccessToRoute = (req,res,next) => {

    if (!isTokenIncluded(req)) {
        return res.status(401).json({
            success:false,
            message:"Token yok"
        });
    }

    const access_token = getAccessTokenFromHeader(req);

    jwt.verify(access_token, process.env.JWT_SECRET_KEY, (err,decoded) => {

        if (err) {
            return res.status(401).json({
                success:false,
                message:"Geçersiz token"
            });
        }
        if(decoded.role==="kullanici")
        {
            req.user = {
               id: decoded.id,
               ad_soyad: decoded.ad_soyad,
               role: decoded.role
        };
        }

        if(decoded.role==="klinik")
        {
            req.klinik = {
               id: decoded.id,
               ad_soyad: decoded.ad_soyad,
               role: decoded.role
        }}
    
        next();
    });
};

module.exports={
    getAccessToRoute
}