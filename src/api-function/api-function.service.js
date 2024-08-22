import moment from "moment";
import People from "../../model/people";
import PeopleDetails from "../../model/people-details";
import {
  NotFoundException,
  PreconditionFailedException,
} from "../common/error-exceptions";
import { buildQueryString, getKundali, getWeekRange } from "../common/helper";
import axios from "axios";
import ApiCategories from "../../model/api-categories";
import ApiSubCategories from "../../model/api-sub-categories";
import { ZODIAC_SIGNS } from "../common/constant/constant";
import { Op } from "sequelize";

class ApiFunctionService {
  static commonParams = {
    api_key: process.env.VEDICASTRO_API_KEY,
    // lang: "en",
  };
  /**
   * @description Get Details from Vedic Astrology API
   * @param {*} reqData
   */
  static async getDetails(reqData) {
    const { category, subCategory, personId } = reqData;

    const getPersonDetails = await People.findOne({ where: { id: personId } });

    if (!getPersonDetails) {
      throw new NotFoundException("Person not found");
    }

    const getpersonDetailsCategorywise = await PeopleDetails.findOne({
      where: {
        category: category,
        subCategory: subCategory,
        peopleId: getPersonDetails.id,
      },
    });

    if (!getpersonDetailsCategorywise) {
      const commonParams = {
        api_key: process.env.VEDICASTRO_API_KEY,
        lang: "en",
      };
      let params = {};
      if (category === "horoscope") {
        const commonParamsHoroscope = {
          ...commonParams,
          dob: moment(getPersonDetails.birthDate, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          ),
          tob: moment(getPersonDetails.birthTime, "HH:mm:ss").format("HH:mm"),
          lat: getPersonDetails.latitude,
          lon: getPersonDetails.longitude,
          tz: getPersonDetails.timezone,
        };
        if (
          subCategory === "personal-characteristics" ||
          subCategory === "ascendant-report"
        ) {
          params = commonParamsHoroscope;
        }
      } else if (category == "dashas") {
        const commonParamsDashas = {
          ...commonParams,
          dob: moment(getPersonDetails.birthDate, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          ),
          tob: moment(getPersonDetails.birthTime, "HH:mm:ss").format("HH:mm"),
          lat: getPersonDetails.latitude,
          lon: getPersonDetails.longitude,
          tz: getPersonDetails.timezone,
        };
        if (subCategory == "maha-dasha-predictions") {
          params = commonParamsDashas;
        }
      } else if (category == "dosha") {
        const commonParamsDosha = {
          ...commonParams,
          dob: moment(getPersonDetails.birthDate, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          ),
          tob: moment(getPersonDetails.birthTime, "HH:mm:ss").format("HH:mm"),
          lat: getPersonDetails.latitude,
          lon: getPersonDetails.longitude,
          tz: getPersonDetails.timezone,
        };
        if (subCategory == "manglik-dosh" || subCategory == "kaalsarp-dosh") {
          params = commonParamsDosha;
        }
      }

      const queryString = buildQueryString(params);

      const url = `https://api.vedicastroapi.com/v3-json/${category}/${subCategory}?${queryString}`;

      const getData = await axios.get(url);

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: getPersonDetails.id,
          category: category,
          subCategory: subCategory,
          details: getData.data.response,
        });
        return {
          personId: getPersonDetails.id,
          details: getData.data.response,
        };
      }
    } else {
      delete getpersonDetailsCategorywise.id;
      delete getpersonDetailsCategorywise.createdAt;
      delete getpersonDetailsCategorywise.updatedAt;
      delete getpersonDetailsCategorywise.peopleId;

      return {
        personId: getPersonDetails.id,
        details: getpersonDetailsCategorywise.details,
      };
    }
  }

  /**
   * @description Get Personal Characteristics
   * @param {*} reqData
   * @returns
   */
  static async personalCharacteristics(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Horoscope" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Personal Characteristics" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
      },
    });

    const params = {
      ...this.commonParams,
      lang: reqData.lang,
      dob: moment(findPerson.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY"),
      tob: moment(findPerson.birthTime, "HH:mm:ss").format("HH:mm"),
      lat: findPerson.latitude,
      lon: findPerson.longitude,
      tz: findPerson.timezone,
    };

    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/horoscope/personal-characteristics?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/horoscope/personal-characteristics?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/horoscope/personal-characteristics?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }

      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Ascendant Report
   * @param {*} reqData
   * @returns
   */
  static async ascendantReport(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Horoscope" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Ascendant-Report" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
      },
    });

    const params = {
      ...this.commonParams,
      lang: reqData.lang,
      dob: moment(findPerson.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY"),
      tob: moment(findPerson.birthTime, "HH:mm:ss").format("HH:mm"),
      lat: findPerson.latitude,
      lon: findPerson.longitude,
      tz: findPerson.timezone,
    };

    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/horoscope/ascendant-report?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/horoscope/ascendant-report?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/horoscope/personal-characteristics?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Maha Dasha Predictions
   * @param {*} reqData
   * @returns
   */
  static async mahaDashaPredictions(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Dashas" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Mahadasha Predictions" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
      },
    });

    const params = {
      ...this.commonParams,
      dob: moment(findPerson.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY"),
      tob: moment(findPerson.birthTime, "HH:mm:ss").format("HH:mm"),
      lat: findPerson.latitude,
      lon: findPerson.longitude,
      tz: findPerson.timezone,
      lang: reqData.lang,
    };
    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/dashas/maha-dasha-predictions?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dashas/maha-dasha-predictions?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dashas/maha-dasha-predictions?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Manglik Dosh
   * @param {*} reqData
   * @returns
   */
  static async maglikDosh(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Dosha" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Manglik Dosh" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
      },
    });

    const params = {
      ...this.commonParams,
      lang: reqData.lang,
      dob: moment(findPerson.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY"),
      tob: moment(findPerson.birthTime, "HH:mm:ss").format("HH:mm"),
      lat: findPerson.latitude,
      lon: findPerson.longitude,
      tz: findPerson.timezone,
    };
    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/dosha/manglik-dosh?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dosha/manglik-dosh?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dosha/manglik-dosh?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Kaalsarp Dosh
   * @param {*} reqData
   * @returns
   */
  static async kaalsarpDosh(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Dosha" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Kaalsarp Dosh" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
      },
    });
    const params = {
      ...this.commonParams,
      lang: reqData.lang,
      dob: moment(findPerson.birthDate, "YYYY-MM-DD").format("DD/MM/YYYY"),
      tob: moment(findPerson.birthTime, "HH:mm:ss").format("HH:mm"),
      lat: findPerson.latitude,
      lon: findPerson.longitude,
      tz: findPerson.timezone,
    };
    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/dosha/kaalsarp-dosh?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dosha/kaalsarp-dosh?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/dosha/kaalsarp-dosh?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Daily Sun Details
   * @param {*} reqData
   * @returns
   */
  static async dailySun(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const kundali = await getKundali(findPerson.id);

    if (!kundali) {
      throw new NotFoundException("Kundali not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Prediction" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Daily Sun" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        dailyDate: moment(reqData.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
      },
    });

    const params = {
      ...this.commonParams,
      date: reqData.date,
      zodiac: ZODIAC_SIGNS[kundali],
      split: reqData.split,
      lang: reqData.lang,
    };

    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/daily-sun?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
          dailyDate: moment(reqData.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/daily-sun?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/daily-sun?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Daily Moon Details
   * @param {*} reqData
   * @returns
   */
  static async dailyMoon(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const kundali = await getKundali(findPerson.id);

    if (!kundali) {
      throw new NotFoundException("Kundali not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Prediction" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Daily Moon" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        dailyDate: moment(reqData.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
      },
    });

    const params = {
      ...this.commonParams,
      date: reqData.date,
      zodiac: ZODIAC_SIGNS[kundali],
      split: reqData.split,
      lang: reqData.lang,
    };

    const queryString = buildQueryString(params);

    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/daily-moon?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
          dailyDate: moment(reqData.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/daily-moon?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/daily-moon?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Weekly Sun Details
   * @param {*} reqData
   * @returns
   */
  static async weeklySun(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const kundali = await getKundali(findPerson.id);

    if (!kundali) {
      throw new NotFoundException("Kundali not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Prediction" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Weekly Sun" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    // Get the current date
    const currentDate = moment().format("YYYY-MM-DD");
    let getPersonDetails;
    if (reqData.week === "thisweek") {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          ...getWeekRange(0),
        },
      });
    } else if (reqData.week === "nextweek") {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          ...getWeekRange(1),
        },
      });
    } else {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          weekStart: {
            [Op.lte]: currentDate, // weekStart should be less than or equal to currentDate
          },
          weekEnd: {
            [Op.gte]: currentDate, // weekEnd should be greater than or equal to currentDate
          },
        },
      });
    }

    if (!getPersonDetails) {
      const thisWeekparams = {
        ...this.commonParams,
        week: "thisweek",
        zodiac: ZODIAC_SIGNS[kundali],
        split: reqData.split,
        lang: reqData.lang,
      };

      const queryStringThisWeek = buildQueryString(thisWeekparams);
      const getDataThisWeek = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringThisWeek}`
      );

      const nextWeekparams = {
        ...this.commonParams,
        week: "nextweek",
        zodiac: ZODIAC_SIGNS[kundali],
        split: reqData.split,
        lang: reqData.lang,
      };

      const queryStringNextWeek = buildQueryString(nextWeekparams);
      const getDataNextWeek = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringNextWeek}`
      );

      let details;

      await PeopleDetails.create({
        peopleId: findPerson.id,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        details: reqData.lang == "en" ? getDataThisWeek.data.response : null,
        hindiDetails:
          reqData.lang == "hi" ? getDataThisWeek.data.response : null,
        ...getWeekRange(0),
        week: "thisweek",
        // weekStart: moment().startOf("week").format("YYYY-MM-DD"),
        // weekEnd: moment().endOf("week").format("YYYY-MM-DD"),
      });

      await PeopleDetails.create({
        peopleId: findPerson.id,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        details: reqData.lang == "en" ? getDataNextWeek.data.response : null,
        hindiDetails:
          reqData.lang == "hi" ? getDataNextWeek.data.response : null,
        ...getWeekRange(1),
        week: "nextweek",
        // weekStart: moment()
        //   .add(1, "weeks")
        //   .startOf("week")
        //   .format("YYYY-MM-DD"),
        // weekEnd: moment().add(1, "weeks").endOf("week").format("YYYY-MM-DD"),
      });
      if (reqData.week === "thisweek" && getDataThisWeek.data.status === 200) {
        details = getDataThisWeek.data.response;
      } else if (
        reqData.week === "nextweek" &&
        getDataNextWeek.data.status === 200
      ) {
        details = getDataNextWeek.data.response;
      } else {
        throw new PreconditionFailedException("Something Went Wrong.");
      }

      return {
        personId: findPerson.id,
        details,
      };
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          if (getPersonDetails.week == "thisweek") {
            const thisWeekparams = {
              ...this.commonParams,
              week: "thisweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringThisWeek = buildQueryString(thisWeekparams);
            const getDataThisWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringThisWeek}`
            );

            details = getDataThisWeek.data.response;
          } else if (getPersonDetails.week == "nextweek") {
            const nextWeekparams = {
              ...this.commonParams,
              week: "nextweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringNextWeek = buildQueryString(nextWeekparams);
            const getDataNextWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringNextWeek}`
            );
            details = getDataNextWeek.data.response;
          }

          await PeopleDetails.update(
            { hindiDetails: details },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          if (getPersonDetails.week == "thisweek") {
            const thisWeekparams = {
              ...this.commonParams,
              week: "thisweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringThisWeek = buildQueryString(thisWeekparams);
            const getDataThisWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringThisWeek}`
            );
            details = getDataThisWeek.data.response;
          } else if (getPersonDetails.week == "nextweek") {
            const nextWeekparams = {
              ...this.commonParams,
              week: "nextweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringNextWeek = buildQueryString(nextWeekparams);
            const getDataNextWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-sun?${queryStringNextWeek}`
            );

            details = getDataNextWeek.data.response;
          }

          await PeopleDetails.update(
            { details: details },
            { where: { id: getPersonDetails.id } }
          );
        }
      }

      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Weekly Moon Details
   * @param {*} reqData
   * @returns
   */
  static async weeklyMoon(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const kundali = await getKundali(findPerson.id);

    if (!kundali) {
      throw new NotFoundException("Kundali not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Prediction" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Weekly Moon" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }
    // Get the current date
    const currentDate = moment().format("YYYY-MM-DD");
    let getPersonDetails;
    if (reqData.week === "thisweek") {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          ...getWeekRange(0),
        },
      });
    } else if (reqData.week === "nextweek") {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          ...getWeekRange(1),
        },
      });
    } else {
      getPersonDetails = await PeopleDetails.findOne({
        where: {
          peopleId: reqData.personId,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          weekStart: {
            [Op.lte]: currentDate, // weekStart should be less than or equal to currentDate
          },
          weekEnd: {
            [Op.gte]: currentDate, // weekEnd should be greater than or equal to currentDate
          },
        },
      });
    }

    if (!getPersonDetails) {
      const thisWeekparams = {
        ...this.commonParams,
        week: "thisweek",
        zodiac: ZODIAC_SIGNS[kundali],
        split: reqData.split,
        lang: reqData.lang,
      };

      const queryStringThisWeek = buildQueryString(thisWeekparams);
      const getDataThisWeek = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringThisWeek}`
      );

      const nextWeekparams = {
        ...this.commonParams,
        week: "nextweek",
        zodiac: ZODIAC_SIGNS[kundali],
        split: reqData.split,
        lang: reqData.lang,
      };

      const queryStringNextWeek = buildQueryString(nextWeekparams);
      const getDataNextWeek = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringNextWeek}`
      );

      let details;

      await PeopleDetails.create({
        peopleId: findPerson.id,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        details: reqData.lang == "en" ? getDataThisWeek.data.response : null,
        hindiDetails:
          reqData.lang == "hi" ? getDataThisWeek.data.response : null,
        week: "thisweek",
        ...getWeekRange(0),
      });

      await PeopleDetails.create({
        peopleId: findPerson.id,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        details: reqData.lang == "en" ? getDataNextWeek.data.response : null,
        hindiDetails:
          reqData.lang == "hi" ? getDataNextWeek.data.response : null,
        week: "nextweek",
        ...getWeekRange(1),
      });
      if (reqData.week === "thisweek" && getDataThisWeek.data.status === 200) {
        details = getDataThisWeek.data.response;
      } else if (
        reqData.week === "nextweek" &&
        getDataNextWeek.data.status === 200
      ) {
        details = getDataNextWeek.data.response;
      } else {
        throw new PreconditionFailedException("Something Went Wrong.");
      }

      return {
        personId: findPerson.id,
        details,
      };
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          if (getPersonDetails.week == "thisweek") {
            const thisWeekparams = {
              ...this.commonParams,
              week: "thisweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringThisWeek = buildQueryString(thisWeekparams);
            const getDataThisWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringThisWeek}`
            );

            details = getDataThisWeek.data.response;
          } else if (getPersonDetails.week == "nextweek") {
            const nextWeekparams = {
              ...this.commonParams,
              week: "nextweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringNextWeek = buildQueryString(nextWeekparams);
            const getDataNextWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringNextWeek}`
            );
            details = getDataNextWeek.data.response;
          }

          await PeopleDetails.update(
            { hindiDetails: details },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          if (getPersonDetails.week == "thisweek") {
            const thisWeekparams = {
              ...this.commonParams,
              week: "thisweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringThisWeek = buildQueryString(thisWeekparams);
            const getDataThisWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringThisWeek}`
            );
            details = getDataThisWeek.data.response;
          } else if (getPersonDetails.week == "nextweek") {
            const nextWeekparams = {
              ...this.commonParams,
              week: "nextweek",
              zodiac: ZODIAC_SIGNS[kundali],
              split: reqData.split,
              lang: reqData.lang,
            };

            const queryStringNextWeek = buildQueryString(nextWeekparams);
            const getDataNextWeek = await axios.get(
              `https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?${queryStringNextWeek}`
            );

            details = getDataNextWeek.data.response;
          }

          await PeopleDetails.update(
            { details: details },
            { where: { id: getPersonDetails.id } }
          );
        }
      }

      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }

  /**
   * @description Get Yearly Prediction Details
   * @param {*} reqData
   */
  static async yearlyPrediction(reqData) {
    const findPerson = await People.findOne({
      where: { id: reqData.personId },
    });
    if (!findPerson) {
      throw new NotFoundException("Person not found");
    }

    const kundali = await getKundali(findPerson.id);

    if (!kundali) {
      throw new NotFoundException("Kundali not found");
    }

    const getCatData = await ApiCategories.findOne({
      where: { name: "Prediction" },
      include: [
        {
          model: ApiSubCategories,
          as: "apiSubCategories",
          where: { name: "Yearly" },
        },
      ],
      raw: true,
      nest: true,
    });

    if (!getCatData) {
      throw new NotFoundException("Category not found");
    }

    const getPersonDetails = await PeopleDetails.findOne({
      where: {
        peopleId: reqData.personId,
        categoryId: getCatData.id,
        subCategoryId: getCatData.apiSubCategories.id,
        year: reqData.year,
      },
    });
    const params = {
      ...this.commonParams,
      year: reqData.year,
      zodiac: ZODIAC_SIGNS[kundali],
      lang: reqData.lang,
    };

    const queryString = buildQueryString(params);
    if (!getPersonDetails) {
      const getData = await axios.get(
        `https://api.vedicastroapi.com/v3-json/prediction/yearly?${queryString}`
      );

      if (getData.data.status !== 200) {
        throw new PreconditionFailedException("Something Went Wrong.");
      } else {
        await PeopleDetails.create({
          peopleId: findPerson.id,
          categoryId: getCatData.id,
          subCategoryId: getCatData.apiSubCategories.id,
          details: reqData.lang == "en" ? getData.data.response : null,
          hindiDetails: reqData.lang == "hi" ? getData.data.response : null,
          year: reqData.year,
        });
        return {
          personId: findPerson.id,
          details: getData.data.response,
        };
      }
    } else {
      let details;
      if (reqData.lang == "hi") {
        if (getPersonDetails.hindiDetails != null) {
          details = getPersonDetails.hindiDetails;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/yearly?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { hindiDetails: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      } else if (reqData.lang == "en") {
        if (getPersonDetails.details != null) {
          details = getPersonDetails.details;
        } else {
          const getData = await axios.get(
            `https://api.vedicastroapi.com/v3-json/prediction/yearly?${queryString}`
          );
          details = getData.data.response;

          await PeopleDetails.update(
            { details: getData.data.response },
            { where: { id: getPersonDetails.id } }
          );
        }
      }
      return {
        personId: findPerson.id,
        details: details,
      };
    }
  }
}

export default ApiFunctionService;
