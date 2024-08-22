import DataService from "./data.service";

class DataController {
  /**
   * @description Get Api Categories and Sub Categories
   * @param {*} req
   * @param {*} res
   */
  static async apiCategories(req, res) {
    const data = await DataService.apiCategories(req.query);
    return res.send({ data });
  }
}

export default DataController;
