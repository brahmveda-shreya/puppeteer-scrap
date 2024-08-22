import moment from "moment";
import People from "../../model/people";

export const buildQueryString = (params) => {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
};

/**
 * @description Get Kundali
 * @param {*} id
 */
export const getKundali = async (id) => {
  const findPerson = await People.findOne({
    where: { id: id },
  });

  if (!findPerson) {
    throw new NotFoundException("Person not found");
  }

  return findPerson.kundali ? findPerson.kundali.rasi : null;
};

export const getWeekRange = (week) => {
  const startOfWeek = moment()
    .add(week, "week")
    .startOf("week")
    .format("YYYY-MM-DD");
  const endOfWeek = moment()
    .add(week, "week")
    .endOf("week")
    .format("YYYY-MM-DD");
  return { weekStart: startOfWeek, weekEnd: endOfWeek };
};
