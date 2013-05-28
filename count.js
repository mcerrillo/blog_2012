

exports.getCount = (function(){
						var contador = 0;
						var pattern = /\//;
						return function(req, res, next){
									if(req.path.match(pattern)){
										contador++;
										req.visitas = contador;
									}
									next();
								}	
					}());