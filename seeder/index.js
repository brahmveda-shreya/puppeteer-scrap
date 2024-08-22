import { apiCategories as ApiCategoriesData } from "./api-categories";
import ApiCategories from "../model/api-categories";
import ApiSubCategories from "../model/api-sub-categories";

const seeder = async () => {
  const apiCatData = await ApiCategories.findAll();

  if (apiCatData.length === 0) {
    for (let i = 0; i < ApiCategoriesData.length; i++) {
      const cat = await ApiCategories.create(ApiCategoriesData[i]);
      for (let j = 0; j < ApiCategoriesData[i].subCategory.length; j++) {
        ApiCategoriesData[i].subCategory[j].apiCategoryId = cat.id;
        await ApiSubCategories.create(ApiCategoriesData[i].subCategory[j]);
      }
    }

    console.log("API CATEGORIES AND SUB CATEGORIES ADDED SUCCESSFULLY");
  }
};

export default seeder;
