var express=require(`express`);
var fs =require(`fs`);
var request=require(`request`);
var cheerio=require(`cheerio`);
var app=express();
var exphbs  = require('express-handlebars');
var auth = require('basic-auth');
var cookieParser = require('cookie-parser');
var database = require('./database').instance;
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqlben',
  database : 'new_schema'
});


app.use(cookieParser());
app.use(express.static('./imagenes'));
app.use('/public',express.static('public'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



var basicAuth = require('basic-auth');
VALID_USER = "AGENTE"
VALID_PASSWORD = "ORION"
var usuario
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };
  // console.log("medio "+user.name);
  var rows=[];


  if (user.name === VALID_USER && user.pass === VALID_PASSWORD) {
    return next();
  } else {
    return unauthorized(res);
  };
};


app.get(`/`,auth,function(req,res){

  res.cookie("agente", true);
  database.read(function(visitas){
    res.render('props_form',{visitas});
  })

});
app.get(`/acerca`,function(req,res){
  res.render('acerca');
});

app.get(`/contacto`,function(req,res){
  res.render('contacto');
});

app.get(`/props`,function(req,res){
  if(req.query.query_url){
    url = req.query.query_url
    request(url, function(error, response, html){

      if(!error){
        var agent = (req.cookies.agente == "true")
        database.read(function(visitas){
          var found = false;

          for (var i = 0; i < visitas.length && !found; i++) {
            if (visitas[i].texto === url) {
              visitas[i].numero++
              found = true;
            }
          }
          if(!found)  {
            database.write(url+","+"0"+"\n");

          }else{
            if(!agent){
              fs.unlinkSync('./historial.txt');
              for (var i = 0, len = visitas.length; i < len; i++) {
                database.write(visitas[i].texto+","+visitas[i].numero+"\n");
              };
            }
          }
        });
        var $ = cheerio.load(html);

        var precio, descripcion, titulo, datos;
        titulo = $("h1").text()

        precio =$(".venta").text()
        descripcion =  $("#id-descipcion-aviso").text().trim()
        datos=[];
        $(".aviso-datos ul li").each(function(i, elem){
          datos.push({texto:$(elem).text()})
        })

        var imagenes_arr=[];
        $(".rsMainSlideImage").each(function(i, elem){
          imagenes_arr.push({imagen:$(elem).attr("href")})
        })

      };
      res.render('props',{titulo,precio,descripcion,datos,imagenes_arr,agent});
    });
  }
});

app.listen(process.argv[2]);
console.log(`Server is up and running`);
exports=module.exports=app;
