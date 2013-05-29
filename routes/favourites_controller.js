var models = require('../models/models.js');

// GET /users/25/favourites
exports.index = function(req, res, next) {
      var format = req.params.format || 'html';
      format = format.toLowerCase();

// Busqueda del array de posts favoritos de un usuario

  models.Favourite
     .findAll({where: {userId: req.user.id}
     })
     .success(function(favourites) {

         // generar array con postIds de los post favoritos

         var postIds = favourites.map( 
                            function(favourite) 
                              {return favourite.postId;}
                           );

        // busca los posts identificados por array postIds

        var patch;
        for(var i=0;i<postIds.length;i++){
          console.log("posicion " + i + " : " + postIds[i]);
        }
        if (postIds.length == 0) {
            patch= '"Posts"."id" in (NULL)';
        } else {
            patch='"Posts"."id" in ('+postIds.join(',')+')';
        } 

        // busca los posts identificados por array postIds

        models.Post.findAll({order: 'updatedAt DESC',

                    where: patch, 

                    include:[{model:models.User,as:'Author'},
                    models.Favourite , models.Comment]
                 })
                 .success(function(posts) {
                            switch (format) { 
                                case 'html':
                                case 'htm':
                                    res.render('posts/index', {
                                      posts: posts
                                    });
                                    break;
                                case 'json':
                                    res.send(posts);
                                    break;
                                case 'xml':
                                    res.send(posts_to_xml(posts));
                                    break;
                                case 'txt':
                                    res.send(posts.map(function(post) {
                                        return post.title+' ('+post.body+')';
                                    }).join('\n'));
                                    break;
                                default:
                                    console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                                    res.send(406);
                              }
                })
                .error(function(error) {
                    next(error);
                });

        })
   };

function posts_to_xml(posts) {

      var builder = require('xmlbuilder');
      var xml = builder.create('posts')
          for (var i in posts) {
              xml.ele('post')
                    .ele('id')
                       .txt(posts[i].id)
                       .up()
                    .ele('title')
                       .txt(posts[i].title)
                       .up()
                    .ele('body')
                       .txt(posts[i].body)
                       .up()
                    .ele('authorId')
                       .txt(posts[i].authorId)
                       .up()
                    .ele('createdAt')
                       .txt(posts[i].createdAt)
                       .up()
                    .ele('updatedAt')
                       .txt(posts[i].updatedAt);
          }
      return xml.end({pretty: true});
}

//PUT
exports.add = function(req, res, next){

  var favorito = models.Favourite.build(
    {
      userId:req.session.user.id,
      postId:req.post.id
    });  
  favorito.save()
        .success(function() {
            req.flash('info', 'Favorito marcado con éxito.');
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
}

//DELETE
exports.delete = function(req, res, next){

    req.post.getFavourites()
      .success(function(favoritos) {
            for(var j in favoritos){
                if(favoritos[j].userId == req.session.user.id){
                      favoritos[j].destroy();
                      req.flash('info', 'Favorito eliminado con exito');
                      next();
                }
            }
            res.redirect('/');
        })
        .error(function(error) {
            next(error);
        });
}

