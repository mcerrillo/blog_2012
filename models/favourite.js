// Definicion del modelo Favourite:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Favourite',
            { userId: {
                 type: DataTypes.INTEGER,
              },
              postId: {
                 type: DataTypes.INTEGER,
              }
            });
}
