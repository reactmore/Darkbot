require("dotenv").config();

module.exports ={
    apiId : Number(process.env.API_ID),
    apiHash : process.env.API_HASH,
    session : process.env.SESSION ? process.env.SESSION : "",
    BOT_TOKEN:process.env.BOT_TOKEN,
    sudo:this.sudo,
    DEVELOPMENT:process.env.STATE === undefined ? false : process.env.STATE,    
    setSudo:function(s) {
        this.sudo = s;
    },
    getSudo:function(){
        return this.sudo;
    }
}