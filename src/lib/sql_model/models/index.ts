module.exports = (sequelize: any, DataTypes: any) => {
    return {
        User: require("@/lib/sql_model/models/users/user.model")(sequelize, DataTypes)
    }
}