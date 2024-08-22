import sequelize from "../src/common/config/database";
import People from "./people";
import ApiCategories from "./api-categories";
import ApiSubCategories from "./api-sub-categories";
import PeopleDetails from "./people-details";
const db = {
  sequelize,
};

ApiCategories.hasMany(ApiSubCategories, {
  foreignKey: "apiCategoryId",
  as: "apiSubCategories",
  sourceKey: "id",
  onDelete: "CASCADE",
});

ApiSubCategories.belongsTo(ApiCategories, {
  foreignKey: "apiCategoryId",
  targetKey: "id",
});

People.hasMany(PeopleDetails, {
  foreignKey: "peopleId",
  as: "peopleDetails",
  sourceKey: "id",
  onDelete: "CASCADE",
});

PeopleDetails.belongsTo(People, {
  foreignKey: "peopleId",
  targetKey: "id",
});

export default db;
