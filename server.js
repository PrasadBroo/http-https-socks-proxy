require('dotenv').config()
const express = require('express');
const app = express();
const request = require('request');
const cherio = require('cheerio');
const Datastore = require('nedb');
const database = new Datastore('database.db');
const port = process.env.PORT || 3000;
app.listen(port);
app.use(express.static('Website'));
var myProxyList = require('./useragentlist');
app.disable('etag');
app.use(express.json({limit:'1mb'}));
myUserAgents =  myProxyList.myUserAgents;



setInterval(dataAdder,1800000);

function dataAdder(){
    console.log('Gathering Starting')
    var base_proxy_url = 'https://free-proxy-list.net/';
    let random = Math.floor(Math.random()*myUserAgents.length);
    var customHeaderRequest = request.defaults({
        
        headers: {
            'User-Agent': myUserAgents[random]
        }
    })

    customHeaderRequest.get(base_proxy_url,(err,res,body)=>{

        const $ = cherio.load(body);
        var proxy_getter = [];
        if(!err && res.statusCode==200){
            for(let i=1;i<=100;i++){
                const ip_add = $(`#proxylisttable > tbody > tr:nth-child(${i}) > td:nth-child(1)`).text();
                const ip_port = $(`#proxylisttable > tbody > tr:nth-child(${i}) > td:nth-child(2)`).text();
                const ip_country = $(`#proxylisttable > tbody > tr:nth-child(${i}) > td:nth-child(4)`).text();
                let ip_annomity = $(`#proxylisttable > tbody > tr:nth-child(${i}) > td:nth-child(5)`).text();
                (ip_annomity=='elite proxy')?ip_annomity='High':(ip_annomity=='anonymous')?ip_annomity='Medium':(ip_annomity=='level3')?ip_annomity='Very High':ip_annomity='Low';
                let ip_type  = $(`#proxylisttable > tbody > tr:nth-child(${i}) > td:nth-child(7)`).text();
                (ip_type=='yes')?ip_type='HTTPS':ip_type='HTTP';

                let All_proxy = {
                    Ip_Address: ip_add,
                    Ip_Port : ip_port,
                    Ip_Type : ip_type,
                    Ip_Country : ip_country,
                    ip_Annomity: ip_annomity,
                }

                proxy_getter.push(All_proxy);
                
            }
                
                database.remove({},{ multi: true },(err,numremoved)=>{
                    database.loadDatabase((err)=>{
                        console.log('done');
                        setTimeout(insertData,100);
                    })
                });

                function insertData(){
                    database.loadDatabase();
                    database.insert(proxy_getter);
                    console.log('Database Added Successfully');
                }
        }
        else{
            console.log('Error Adding Database');
        }
        
        
       
    })
}

app.get('/get_http_proxy',(req,mainres)=>{

    database.loadDatabase();
    database.find({Ip_Type:'HTTP'},{Ip_Address:1,Ip_Port:1,Ip_Type:1,Ip_Country:1,ip_Annomity:1,_id:0},(err,data)=>{
        if(!err){

            let send_random_data = Math.floor(Math.random()*data.length);
            mainres.json(data[send_random_data]);

        }
        else if(err){
            mainres.json({Status:'Fail',Status_Code:69,Message:'Plz Try Again We Are Updating Database'});
        }
        else{
           mainres.json({Status:'Fail',Status_Code:70,Message:'Plz Try Again We Are Updating Database'});
        }
    })

});


app.get('/get_https_proxy',(req,mainres)=>{

    database.loadDatabase();
    database.find({Ip_Type:'HTTPS'},{Ip_Address:1,Ip_Port:1,Ip_Type:1,Ip_Country:1,ip_Annomity:1,_id:0},(err,data)=>{
        if(!err){

            let send_random_data = Math.floor(Math.random()*data.length);
            mainres.json(data[send_random_data]);

        }
        else if(err){
            mainres.json({Status:'Fail',Status_Code:69,Message:'Plz Try Again We Are Updating Database'});
        }
        else{
           mainres.json({Status:'Fail',Status_Code:70,Message:'Plz Try Again We Are Updating Database'});
        }
    })

})


