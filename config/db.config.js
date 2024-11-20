const mongoose = require("mongoose")

 exports.connectDB = async ()=>{
        try {
            await mongoose.connect(process.env.MONGO_URI)
            console.log("Db Connected  Successfully.");
        } catch (error) {
            console.info(error)
        }
}


