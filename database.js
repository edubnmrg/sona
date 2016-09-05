var fs =require(`fs`);


function Database(){}

Database.prototype.read = function(callback){
  var visitas = [];
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./historial.txt')
  });

  lineReader.on('line', function (line) {
    var partes=[];
    partes=line.split(",");
    //console.log(partes[0]+partes[1]);
    visitas.push({texto: partes[0],numero: partes[1]});
  });
  lineReader.on('close',function(){
    callback(visitas)
  });
  return true;
}
Database.prototype.write = function(item){
  var fs = require('fs');
  fs.appendFile("./historial.txt", (item), function (err) {
  });
}


Database.prototype.flush = function(){

}

module.exports.instance = new Database();
