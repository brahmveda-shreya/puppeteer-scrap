import ApiCategories from "../../model/api-categories";
import ApiSubCategories from "../../model/api-sub-categories";

class DataService {
  /**
   * @description Get Api Categories and Sub Categories
   * @param {*} reqData
   */
  static async apiCategories(reqData) {
    let query = {};

    if (reqData.id) {
      query.where = {
        id: +reqData.id,
      };
    }

    const response = await ApiCategories.findAll(query);

    if (response && response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        const cat = response[i];

        await ApiSubCategories.findAll({
          where: {
            apiCategoryId: cat.id,
          },
        }).then((subCat) => {
          response[i].subCategories = subCat;
        });
      }
    }
    return response;
  }
}

export default DataService;
