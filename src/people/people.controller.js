import PeopleService from "./people.service";

class PeopleController {
  /**
   * @description Get Peoples List
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async index(req, res) {
    const response = await PeopleService.index();
    return res.send(response);
  }

  /**
   * @description Add People
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async create(req, res) {
    const response = await PeopleService.create(req.body);
    return res.send({ message: response });
  }

  /**
   * @description Add Partner
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async partner(req, res) {
    const response = await PeopleService.partner(req.body);

    return res.send({ message: response });
  }

  static async sendMessage(req, res) {
    req.body.language = req.query.language;
    const response = await PeopleService.sendMessage(req.body);
    return res.send({ data: response });
  }
}

export default PeopleController;
