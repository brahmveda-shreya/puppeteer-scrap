import axios from "axios";
import People from "../../model/people";
import { PreconditionFailedException } from "../common/error-exceptions";
import moment from "moment";
import { Op } from "sequelize";

class PeopleService {
  /**
   * @description Get Peoples List
   * @returns
   */
  static async index() {
    const response = await People.findAll({ where: { partnerId: null } });
    return response;
  }

  /**
   * @description Add People
   * @param {*} reqData
   * @returns
   */
  static async create(reqData) {
    const {
      name,
      gender,
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
    } = reqData;

    console.log("reqData", reqData);

    const getUser = await People.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
        birthTime: birthTime,
        latitude: latitude,
        longitude: longitude,
        timezone: timezone,
        birthDate: birthDate,
        gender: gender,
        // [Op.and]: [
        //   sequelize.where(
        //     sequelize.fn("DATE", sequelize.col("birthDate")),
        //     birthDate
        //   ),
        // ],
      },
    });

    if (getUser) {
      throw new PreconditionFailedException("User already exists");
    }

    const url = `https://api.vedicastroapi.com/v3-json/horoscope/planet-details?dob=${moment(
      birthDate
    ).format(
      "DD/MM/YYYY"
    )}&tob=${birthTime}&lat=${latitude}&lon=${longitude}&tz=${timezone}&api_key=${
      process.env.VEDICASTRO_API_KEY
    }&lang=en`;
    try {
      // Make the API request
      const response = await axios.get(url);

      // Access the JSON data from the response
      reqData.kundali = response.data.response;

      if (response.status == 200) {
        await People.create(reqData);
      }
      return "People Added Successfully";
    } catch (error) {
      console.error("Error fetching Kundali data:", error);
      throw error;
    }
  }

  /**
   * @description Add Partner
   * @param {*} reqData
   * @returns
   */
  static async partner(reqData) {
    const {
      name,
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
      partnerId,
    } = reqData;

    const getPartner = await People.findOne({
      where: {
        partnerId: partnerId,
      },
    });

    const url = `https://api.vedicastroapi.com/v3-json/horoscope/planet-details?dob=${moment(
      birthDate
    ).format(
      "DD/MM/YYYY"
    )}&tob=${birthTime}&lat=${latitude}&lon=${longitude}&tz=${timezone}&api_key=${
      process.env.VEDICASTRO_API_KEY
    }&lang=en`;
    try {
      // Make the API request
      const response = await axios.get(url);

      // Access the JSON data from the response
      reqData.kundali = response.data.response;

      if (response.status == 200 && !getPartner) {
        await People.create(reqData);
      } else {
        await People.update(reqData, {
          where: { id: getPartner.id },
        });
      }
      return "Partner Details Added Successfully";
    } catch (error) {
      console.error("Error fetching Kundali data:", error);
      throw error;
    }
  }

  static async sendMessage(reqData) {
    const person = await People.findOne({ where: { id: reqData.peopleId } });

    const sendData = {
      personId: person.id,
      user_details: {
        dob: person.birthDate,
        tob: person.birthTime,
        lat: person.latitude,
        lon: person.longitude,
        tz: person.timezone,
        kundali: await getKundali(person.id),
      },
      lang: reqData.language == "Hindi" ? "hi" : "en",
      user_prompt: reqData.message,
    };

    console.log(sendData);

    // call python api
    const getResponse = await axios.post(
      "https://openai-api-w43t.onrender.com/get-astrology-prediction",
      sendData
    );

    if (getResponse.status == 200) {
      return getResponse.data;
    } else {
      throw new PreconditionFailedException("Something went wrong");
    }
  }
}

export default PeopleService;
