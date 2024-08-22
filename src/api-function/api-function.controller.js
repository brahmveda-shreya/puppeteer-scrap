import ApiFunctionService from "./api-function.service";

class ApiFunctionController {
  /**
   * @description Get Details from Vedic Astrology API
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async getDetails(req, res) {
    const response = await ApiFunctionService.getDetails(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Personal Characteristics
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async personalCharacteristics(req, res) {
    const response = await ApiFunctionService.personalCharacteristics(
      req.query
    );
    return res.send({ data: response });
  }

  /**
   * @description Get Ascendant Report
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async ascendantReport(req, res) {
    const response = await ApiFunctionService.ascendantReport(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Maha Dasha Predictions
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async mahaDashaPredictions(req, res) {
    const response = await ApiFunctionService.mahaDashaPredictions(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Maglik Dosh
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async maglikDosh(req, res) {
    const response = await ApiFunctionService.maglikDosh(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Kaalsarp Dosh
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async kaalsarpDosh(req, res) {
    const response = await ApiFunctionService.kaalsarpDosh(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Daily Sun Details
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async dailySun(req, res) {
    const response = await ApiFunctionService.dailySun(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Daily Moon Details
   * @param {*} req
   * @param {*} res
   * @returns
   */

  static async dailyMoon(req, res) {
    const response = await ApiFunctionService.dailyMoon(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Weekly Sun Details
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async weeklySun(req, res) {
    const response = await ApiFunctionService.weeklySun(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Weekly Moon Details
   * @param {*} req
   * @param {*} res
   * @returns
   */

  static async weeklyMoon(req, res) {
    const response = await ApiFunctionService.weeklyMoon(req.query);
    return res.send({ data: response });
  }

  /**
   * @description Get Yearly Predictions
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  static async yearlyPrediction(req, res) {
    const response = await ApiFunctionService.yearlyPrediction(req.query);
    return res.send({ data: response });
  }
}
export default ApiFunctionController;
